# INCODOL — Backend (FastAPI)

API REST para la **Carnicería Fuente de Vida / INCODOL**.
Stack: **FastAPI + SQLAlchemy + PostgreSQL + JWT**.

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
cp .env.example .env  # editar credenciales y JWT_SECRET
```

## 3. Crear la base de datos PostgreSQL
```sql
CREATE USER incodol WITH PASSWORD 'incodol';
CREATE DATABASE incodol OWNER incodol;
```
(O dejar `DATABASE_URL=sqlite:///./dev.db` en `.env` para empezar sin Postgres.)

## 4. Arrancar
```bash
uvicorn app.main:app --reload --port 4000
```

- API: <http://localhost:4000>
- Docs Swagger: <http://localhost:4000/docs>
- Docs ReDoc: <http://localhost:4000/redoc>

Al primer arranque se crea automáticamente el admin con las credenciales del `.env`.

## 5. Endpoints actuales

| Método | Ruta                              | Descripción                              | Auth |
|--------|-----------------------------------|------------------------------------------|------|
| POST   | `/auth/register`                  | Registro público (rol cliente)           | —    |
| POST   | `/auth/login`                     | Login → devuelve JWT                     | —    |
| GET    | `/auth/me`                        | Datos del usuario logueado               | JWT  |
| POST   | `/auth/reset-password/request`    | Solicitar token de recuperación          | —    |
| POST   | `/auth/reset-password/confirm`    | Confirmar nueva contraseña               | —    |
| GET    | `/health`                         | Health check                             | —    |

## 6. Roles
- `admin` — acceso total al panel.
- `vendedor` — gestión de pedidos y stock (pendiente).
- `cliente` — registro público, ver y hacer pedidos (pendiente).

## 7. Próximos pasos (módulos pendientes)
- CRUD de productos y stock
- Gestión de pedidos
- Dashboard con reportes
- Envío real de emails para reset password (Sendgrid / SMTP)

## 8. Estructura
```
backend/
├── app/
│   ├── core/        # config, db, security, deps
│   ├── models/      # SQLAlchemy
│   ├── schemas/     # Pydantic
│   ├── routers/     # endpoints
│   └── main.py
├── requirements.txt
├── .env.example
└── README.md
```
