# NEXZUS IT SERVICE — Backend (FastAPI)

API REST de **NEXZUS IT SERVICE** (venta de software, hardware y servicios IT en Colombia).
Stack: **FastAPI + SQLAlchemy 2 + Alembic + JWT**. Base de datos PostgreSQL (Docker Compose)
o SQLite (Render / desarrollo rápido). Pagos con **Wompi** y módulo de **PQR**.

## 1. Requisitos
- Python 3.11+
- PostgreSQL 14+ (o SQLite para desarrollo rápido)

## 2. Instalación
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # editar JWT_SECRET, llaves de Wompi, etc.
```

## 3. Migraciones y arranque
```bash
alembic upgrade head
uvicorn app.main:app --reload --port 4000
```

- API: <http://localhost:4000>
- Docs Swagger: <http://localhost:4000/docs>

Con Docker Compose (desde la raíz del repo) las migraciones corren solas: `docker compose up --build`.

Al arrancar se insertan datos demo **solo en las tablas vacías** (admin, productos, categorías,
promociones, artículos, soluciones destacadas y textos del sitio). Una BD que ya tenga datos
no se modifica: para cambiar el contenido usa el panel de administración.

## 4. Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registro público (rol cliente) | — |
| POST | `/auth/login` | Login → JWT | — |
| GET | `/auth/me` | Usuario logueado | JWT |
| GET | `/products?category=<slug>&q=` | Catálogo (category es el slug de `/catalog-categories`) | — |
| POST/PATCH/DELETE | `/products[/{id}]` | CRUD de productos | admin/vendedor |
| POST | `/orders` | Pedido por WhatsApp (sin pago en línea) | — |
| GET/PATCH | `/orders`, `/orders/{id}/status` | Gestión de pedidos | admin/vendedor |
| POST | `/payments/checkout` | Crea pedido y devuelve URL firmada del Web Checkout de Wompi | — |
| GET | `/payments/status?reference=` o `?id=` | Estado del pago (`id` = transacción Wompi; consulta Wompi y actualiza el pedido) | — |
| POST | `/payments/wompi/webhook` | Eventos `transaction.updated` de Wompi (checksum verificado) | firma Wompi |
| POST | `/pqr` | Radicar PQR | — |
| GET | `/pqr/consulta?radicado=&documento=` | Consultar PQR (404 genérico si no coincide) | — |
| GET | `/pqr?estado=&tipo=` | Listar PQR | admin/vendedor |
| PATCH | `/pqr/{id}` | Cambiar estado / responder | admin/vendedor |
| GET/PATCH | `/settings` | Textos del sitio, contacto, WhatsApp | admin (escritura) |
| CRUD | `/promotions`, `/blog-posts`, `/catalog-categories`, `/premium-sections`, `/premium-cuts` | Contenido editable | admin (escritura) |
| GET | `/dashboard/stats` | Indicadores | admin/vendedor |
| GET | `/health` | Health check | — |

### Pagos (Wompi)
- `POST /payments/checkout` body:
  `{ customer_name, customer_email, customer_phone, customer_document?, address?, notes?, items: [{ product_id?, name, qty, unit_price }] }`
  - Con `product_id` se usa el precio de la BD (el producto debe estar activo). Sin `product_id`
    (promociones) se usa `unit_price`, que debe ser > 0. `qty` entre 1 y 99.
  - Respuesta 201: `{ order_id, reference, amount_in_cents, currency, public_key, signature_integrity, redirect_url, checkout_url }`.
    El frontend redirige a `checkout_url`.
  - Sin llaves configuradas: **503** `"Pasarela de pago no configurada"`.
- Referencia del pedido: `NXZ-<order_id>-<6 hex>`.
- Firma de integridad: `SHA256(reference + amount_in_cents + "COP" + WOMPI_INTEGRITY_SECRET)`.
- Webhook: `SHA256(valores de signature.properties tomados de data + timestamp + WOMPI_EVENTS_SECRET)`,
  comparado con `signature.checksum`. Checksum inválido → 401.
- Estados: `APPROVED→aprobado`, `DECLINED→rechazado`, `VOIDED→anulado`, `ERROR→error`, `PENDING→pendiente`.
  Un pago aprobado pasa el pedido a `confirmado`. Si el monto o la moneda no coinciden con el pedido,
  el pago queda en `error` y el pedido no se confirma.

### PQR (Ley 1755 de 2015)
- Tipos: `peticion`, `queja`, `reclamo`, `sugerencia`, `felicitacion`.
  Estados: `radicado`, `en_tramite`, `respondido`, `cerrado`. Documento: `CC`, `CE`, `NIT`, `PAS`.
- Radicado: `PQR-<año>-<id de 6 dígitos>`.
- `fecha_limite_respuesta` = 15 días hábiles (lunes a viernes) después de la radicación.
  **No descuenta festivos colombianos.**
- `acepta_tratamiento_datos` debe ser `true`.
- `PATCH /pqr/{id}` con `respuesta` deja la PQR en `respondido` (o `cerrado` si se envía
  `estado: "cerrado"`) y fija `fecha_respuesta`.

## 5. Configurar Wompi (sandbox)
1. Crea una cuenta en <https://comercios.wompi.co> y entra a **Desarrolladores**.
2. Copia las llaves del ambiente de **pruebas** al `.env` (o a las variables de Render):
   ```env
   WOMPI_ENV=sandbox
   WOMPI_PUBLIC_KEY=pub_test_...
   WOMPI_PRIVATE_KEY=prv_test_...
   WOMPI_INTEGRITY_SECRET=test_integrity_...
   WOMPI_EVENTS_SECRET=test_events_...
   PUBLIC_SITE_URL=http://localhost:3000
   ```
3. En **Desarrolladores → URL de eventos** registra `https://<tu-api>/payments/wompi/webhook`
   (debe ser una URL pública; en local puedes usar un túnel como ngrok).
4. Paga con los datos de prueba de Wompi (p. ej. tarjeta `4242 4242 4242 4242` → aprobada).
5. Para producción: `WOMPI_ENV=production` y las llaves `pub_prod_...`, `prv_prod_...`, etc.

## 6. Roles
- `admin` — acceso total al panel.
- `vendedor` — pedidos, productos y PQR.
- `cliente` — registro público.

## 7. Pruebas
```bash
python test_e2e.py
```

## 8. Estructura
```
backend/
├── alembic/         # migraciones
├── app/
│   ├── core/        # config, db, security, deps
│   ├── models/      # SQLAlchemy (user, product, content, pqr)
│   ├── schemas/     # Pydantic
│   ├── routers/     # endpoints (incluye payments.py y pqr.py)
│   └── main.py      # app + seed
├── requirements.txt
├── .env.example
└── README.md
```
