"""Pagos en linea con Wompi (Web Checkout: tarjetas, PSE, Nequi, Bancolombia).

Flujo:
1. POST /payments/checkout crea el pedido (channel="wompi", payment_status="pendiente"),
   calcula el monto con precios de la BD y devuelve la URL del Web Checkout firmada.
2. Wompi redirige a {PUBLIC_SITE_URL}/checkout/resultado?id=<transaction_id>; esa pagina
   llama GET /payments/status?id=... y el backend consulta la transaccion en Wompi.
3. Wompi tambien notifica POST /payments/wompi/webhook (transaction.updated), que es la
   fuente confiable: se valida el checksum con WOMPI_EVENTS_SECRET.

Solo stdlib (urllib) para hablar con Wompi: no agrega dependencias.
"""
import hashlib
import hmac
import json
import re
import secrets
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.product import Order, OrderItem, OrderStatus, Product
from app.schemas.payment import CheckoutIn, CheckoutOut, PaymentStatusOut


router = APIRouter(prefix="/payments", tags=["payments"])

CURRENCY = "COP"
WOMPI_CHECKOUT_URL = "https://checkout.wompi.co/p/"

# Estado de la transaccion en Wompi -> payment_status del pedido
WOMPI_STATUS_MAP = {
    "APPROVED": "aprobado",
    "DECLINED": "rechazado",
    "VOIDED": "anulado",
    "ERROR": "error",
    "PENDING": "pendiente",
}

# Los ids de transaccion de Wompi son del tipo "1234-1610641025-49201"
_TX_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,80}$")


# ---------- helpers ----------
def _amount_in_cents(order: Order) -> int:
    return int(round((order.total or 0) * 100))


def integrity_signature(reference: str, amount_in_cents: int, currency: str, secret: str) -> str:
    """SHA256(reference + amount_in_cents + currency + integrity_secret), en hex."""
    raw = f"{reference}{amount_in_cents}{currency}{secret}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _resolve_path(data: Dict[str, Any], path: str) -> Any:
    """Resuelve 'transaction.amount_in_cents' dentro del dict `data` del evento."""
    cur: Any = data
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            raise KeyError(path)
        cur = cur[part]
    return cur


def event_checksum(event: Dict[str, Any], secret: str) -> str:
    """Checksum de un evento Wompi: SHA256(valores de signature.properties + timestamp + secreto)."""
    props = event["signature"]["properties"]
    values = "".join(str(_resolve_path(event["data"], p)) for p in props)
    raw = f"{values}{event['timestamp']}{secret}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _status_out(order: Order) -> PaymentStatusOut:
    return PaymentStatusOut(
        reference=order.reference,
        order_id=order.id,
        status=order.payment_status or "pendiente",
        amount_in_cents=_amount_in_cents(order),
        payment_method=order.payment_method,
        transaction_id=order.transaction_id,
        customer_name=order.customer_name,
    )


def _apply_transaction(order: Order, tx: Dict[str, Any]) -> None:
    """Actualiza el pedido con los datos de una transaccion Wompi."""
    new_status = WOMPI_STATUS_MAP.get(str(tx.get("status", "")).upper(), "error")

    # Defensa: si el monto o la moneda no cuadran con el pedido, no se aprueba.
    if new_status == "aprobado" and (
        tx.get("amount_in_cents") != _amount_in_cents(order) or tx.get("currency") != CURRENCY
    ):
        new_status = "error"

    order.payment_status = new_status
    if tx.get("id"):
        order.transaction_id = str(tx["id"])[:80]
    if tx.get("payment_method_type"):
        order.payment_method = str(tx["payment_method_type"])[:50]
    if new_status == "aprobado" and order.status == OrderStatus.pendiente:
        order.status = OrderStatus.confirmado
    order.updated_at = datetime.now(timezone.utc)


def _fetch_transaction(transaction_id: str) -> Dict[str, Any]:
    """GET {WOMPI_API}/transactions/{id}. Devuelve el objeto `data`."""
    url = f"{settings.wompi_api_base}/transactions/{quote(transaction_id, safe='')}"
    req = urllib.request.Request(url, headers={"Accept": "application/json",
                                               "User-Agent": "nexzus-api/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")
        raise HTTPException(status_code=502, detail="No se pudo consultar la pasarela de pago")
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise HTTPException(status_code=502, detail="No se pudo consultar la pasarela de pago")
    data = body.get("data") if isinstance(body, dict) else None
    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="Respuesta inválida de la pasarela de pago")
    return data


# ---------- endpoints ----------
@router.post("/checkout", response_model=CheckoutOut, status_code=status.HTTP_201_CREATED)
def checkout(payload: CheckoutIn, db: Session = Depends(get_db)):
    """Crea el pedido y devuelve la URL firmada del Web Checkout de Wompi."""
    if not settings.wompi_checkout_enabled:
        raise HTTPException(status_code=503, detail="Pasarela de pago no configurada")

    order = Order(
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip(),
        customer_email=str(payload.customer_email),
        customer_document=(payload.customer_document or "").strip() or None,
        address=payload.address,
        notes=payload.notes,
        channel="wompi",
        status=OrderStatus.pendiente,
        payment_status="pendiente",
    )

    total = 0.0
    for it in payload.items:
        if it.product_id is not None:
            product = db.query(Product).filter(Product.id == it.product_id).first()
            if not product or not product.is_active:
                raise HTTPException(status_code=422,
                                    detail=f"El producto {it.product_id} no está disponible")
            name, unit_price = product.name, float(product.price)
            if unit_price <= 0:
                raise HTTPException(status_code=422,
                                    detail=f"El producto {product.name} no tiene precio válido")
        else:
            name, unit_price = it.name.strip(), float(it.unit_price)
            if unit_price <= 0:
                raise HTTPException(status_code=422,
                                    detail=f"Precio inválido para el item {name}")
        sub = round(unit_price * it.qty, 2)
        total += sub
        order.items.append(OrderItem(product_id=it.product_id, product_name=name[:150],
                                     unit_price=unit_price, qty=it.qty, subtotal=sub))
    order.total = round(total, 2)

    amount = _amount_in_cents(order)
    if amount <= 0:
        raise HTTPException(status_code=422, detail="El total del pedido debe ser mayor a cero")

    db.add(order)
    db.flush()  # asigna order.id
    order.reference = f"NXZ-{order.id}-{secrets.token_hex(3)}"
    db.commit()
    db.refresh(order)

    public_key = settings.WOMPI_PUBLIC_KEY.strip()
    signature = integrity_signature(order.reference, amount, CURRENCY,
                                    settings.WOMPI_INTEGRITY_SECRET.strip())
    redirect_url = f"{settings.PUBLIC_SITE_URL.rstrip('/')}/checkout/resultado"

    # Las llaves con ':' (signature:integrity, customer-data:...) van literales.
    params = [
        ("public-key", public_key),
        ("currency", CURRENCY),
        ("amount-in-cents", str(amount)),
        ("reference", order.reference),
        ("signature:integrity", signature),
        ("redirect-url", redirect_url),
        ("customer-data:email", order.customer_email),
        ("customer-data:full-name", order.customer_name),
        ("customer-data:phone-number", order.customer_phone),
    ]
    query = "&".join(f"{k}={quote(v, safe='')}" for k, v in params)

    return CheckoutOut(
        order_id=order.id,
        reference=order.reference,
        amount_in_cents=amount,
        public_key=public_key,
        signature_integrity=signature,
        redirect_url=redirect_url,
        checkout_url=f"{WOMPI_CHECKOUT_URL}?{query}",
    )


@router.get("/status", response_model=PaymentStatusOut)
def payment_status(
    reference: Optional[str] = Query(default=None, max_length=40),
    id: Optional[str] = Query(default=None, max_length=80, description="transaction_id de Wompi"),
    db: Session = Depends(get_db),
):
    """Estado del pago. Con `id` consulta la transaccion en Wompi y actualiza el pedido."""
    if id:
        if not _TX_ID_RE.match(id):
            raise HTTPException(status_code=400, detail="Identificador de transacción inválido")
        tx = _fetch_transaction(id)
        order = db.query(Order).filter(Order.reference == tx.get("reference")).first()
        if not order:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        _apply_transaction(order, tx)
        db.commit()
        db.refresh(order)
        return _status_out(order)

    if reference:
        order = db.query(Order).filter(Order.reference == reference.strip()).first()
        if not order:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return _status_out(order)

    raise HTTPException(status_code=400, detail="Debe enviar reference o id")


@router.post("/wompi/webhook")
async def wompi_webhook(request: Request, db: Session = Depends(get_db)):
    """Eventos de Wompi. Responde 200 a todo evento valido (aunque se ignore) para que
    Wompi no reintente; 401 si el checksum no coincide."""
    secret = settings.WOMPI_EVENTS_SECRET.strip()
    if not secret:
        raise HTTPException(status_code=503, detail="Pasarela de pago no configurada")

    try:
        event = await request.json()
        received = str(event["signature"]["checksum"])
        expected = event_checksum(event, secret)
    except (ValueError, KeyError, TypeError):
        raise HTTPException(status_code=400, detail="Evento inválido")

    if not hmac.compare_digest(expected.lower(), received.lower()):
        raise HTTPException(status_code=401, detail="Firma inválida")

    if event.get("event") != "transaction.updated":
        return {"ok": True, "ignored": True}

    tx = (event.get("data") or {}).get("transaction") or {}
    order = db.query(Order).filter(Order.reference == tx.get("reference")).first()
    if not order:
        return {"ok": True, "ignored": True}

    _apply_transaction(order, tx)
    db.commit()
    return {"ok": True}
