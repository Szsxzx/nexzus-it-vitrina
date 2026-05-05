"""Pedidos. Crear publico, listar/actualizar admin/vendedor."""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.product import Order, OrderItem, OrderStatus
from app.schemas.product import OrderCreate, OrderOut, OrderStatusUpdate


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Endpoint publico: cualquier visitante puede crear un pedido."""
    if not payload.items:
        raise HTTPException(status_code=400, detail="El pedido debe tener al menos un item")

    order = Order(
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email,
        address=payload.address,
        notes=payload.notes,
        channel=payload.channel,
        status=OrderStatus.pendiente,
    )
    total = 0.0
    for it in payload.items:
        sub = it.unit_price * it.qty
        total += sub
        order.items.append(OrderItem(
            product_id=it.product_id,
            product_name=it.product_name,
            unit_price=it.unit_price,
            qty=it.qty,
            subtotal=sub,
        ))
    order.total = total
    db.add(order); db.commit(); db.refresh(order)
    return order


@router.get("", response_model=List[OrderOut],
            dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def list_orders(
    status_filter: Optional[OrderStatus] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Order)
    if status_filter:
        q = q.filter(Order.status == status_filter)
    return q.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut,
            dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def get_order(order_id: int, db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return o


@router.patch("/{order_id}/status", response_model=OrderOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    o.status = payload.status
    o.updated_at = datetime.now(timezone.utc)
    db.commit(); db.refresh(o)
    return o
