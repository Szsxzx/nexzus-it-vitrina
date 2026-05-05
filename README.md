
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9b5d7b16-0fad-4219-ba5a-19b8f705c8d2" />

# Carnicería Fuente de Vida / Vitrina

Sitio web público + panel administrativo completo.
Backend Python (FastAPI) + Frontend Next.js + JWT con roles.

```
.
├── backend/             # API FastAPI + SQLAlchemy + JWT  (30/30 tests OK)
├── frontend/            # Next.js 14 + React + TypeScript + Tailwind
├── legacy/              # Código original HTML/CSS/JS (referencia)
├── BUGS.md              # Auditoría de bugs del legacy ya resueltos
├── start-all.bat        # ← DOBLE CLIC para arrancar todo
├── start-all.ps1
├── start-backend.ps1    # Solo API (puerto 4000)
├── start-frontend.ps1   # Solo web (puerto 3000)
└── .gitignore
```

## Arranque rápido (Windows)

**Doble-clic a `start-all.bat`.** Espera 1-5 min la primera vez (instala
dependencias) y abre <http://localhost:3000>.

Los scripts hacen automáticamente:
- Verifican Python y Node instalados.
- Crean venv (si la ruta lo permite) o usan Python global.
- Instalan dependencias (`pip` y `npm`).
- Crean `.env` y `.env.local` con valores por default (SQLite).
- Arrancan ambos servidores con auto-reload.

## Pre-requisitos

| Requisito | Verificar | Si no lo tienes |
|-----------|-----------|-----------------|
| **Python 3.11–3.13** (NO 3.14 — algunos paquetes aún no compilan) | `python --version` | https://www.python.org/downloads/release/python-3130/ |
| **Node.js 18.18+** (recomendado 20+) | `node --version` | https://nodejs.org/ |

> ⚠️ **Si tienes Python 3.14**, la instalación de `pydantic-core` puede fallar
> intentando compilar Rust. Solución: instala Python 3.13 (que tiene wheels para todo).

## Páginas disponibles

### Web pública
- <http://localhost:3000> — home con catálogo, categorías, premium, blog, carrito → WhatsApp.

### Panel admin
- <http://localhost:3000/admin/login> — login (usuario `admin`, contraseña `Admin123!`).
- <http://localhost:3000/admin/dashboard> — métricas en vivo (productos, pedidos, ventas, usuarios).
- <http://localhost:3000/admin/products> — CRUD completo de productos.
- <http://localhost:3000/admin/orders> — pedidos con filtro por estado y cambio de estado.
- <http://localhost:3000/admin/users> — gestión de usuarios (solo rol admin).
- <http://localhost:3000/admin/reset-password> — recuperar contraseña.

### API (backend)
- Swagger interactivo: <http://localhost:4000/docs>
- ReDoc: <http://localhost:4000/redoc>

## Roles y permisos

| Endpoint | Público | Cliente | Vendedor | Admin |
|----------|:-:|:-:|:-:|:-:|
| `GET /products` | ✅ | ✅ | ✅ | ✅ |
| `POST /orders` | ✅ | ✅ | ✅ | ✅ |
| `POST /products`, `PATCH /products` | — | — | ✅ | ✅ |
| `DELETE /products` | — | — | — | ✅ |
| `GET /orders`, `PATCH /orders/:id/status` | — | — | ✅ | ✅ |
| `GET /users`, `PATCH /users` | — | — | — | ✅ |
| `GET /dashboard/stats` | — | — | ✅ | ✅ |

## Tests

**Backend** (30 tests E2E):
```bash
cd backend
python test_e2e.py
```
Cubre login, registro, productos CRUD, pedidos con cambio de estado, usuarios,
guards por rol, dashboard, validación de "no degradarte a ti mismo".

**Frontend** (validación de build):
```bash
cd frontend
npm run build
```
Compila las 8 rutas estáticas sin errores de TypeScript.

## Stack

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | Python + FastAPI | 3.11–3.13 / 0.115 |
| ORM | SQLAlchemy | 2.0+ |
| Base de datos | SQLite (dev) / PostgreSQL (prod) | — |
| Auth | JWT (python-jose) + bcrypt | — |
| Frontend | Next.js (App Router) | 14.2 |
| UI | React + TypeScript + Tailwind | 18 / 5 / 3 |

## Estado del proyecto

| Módulo | Estado |
|--------|--------|
| Auth con JWT y roles (admin/vendedor/cliente) | ✅ Funcional |
| Productos CRUD desde panel | ✅ Funcional |
| Pedidos con cambio de estado | ✅ Funcional |
| Usuarios CRUD desde panel | ✅ Funcional |
| Dashboard con métricas reales | ✅ Funcional |
| Catálogo público + carrito + WhatsApp | ✅ Funcional |
| Login + reset password | ✅ Funcional |
| Test E2E del backend | ✅ 30/30 OK |
| Build frontend | ✅ 8/8 rutas OK |
| Envío real de email para reset | ⚠️ Pendiente (token sale en consola) |
| Subir imágenes desde el panel | ⚠️ Pendiente |
| Catálogo público leyendo del API | ⚠️ Pendiente (usa mock data) |
| Docker + docker-compose | ⚠️ Pendiente |

## Si algo falla

| Síntoma | Solución |
|---------|----------|
| `'python' no se reconoce` | Instala Python 3.13 desde python.org y reinicia PowerShell |
| `'npm' no se reconoce` | Instala Node.js LTS desde nodejs.org y reinicia PowerShell |
| `Activate.ps1 ... no se puede cargar` | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| `failed building wheel for pydantic-core` | Tu Python 3.14 es muy nuevo. Instala Python 3.13 |
| `npm install` cuelga | Borra `frontend/node_modules` y `package-lock.json`, reintenta |
| Login dice "no se pudo conectar" | El backend no está corriendo. Mira la otra ventana de PowerShell |
| Página en blanco | Abre DevTools (F12) → Console → mira el error |

Para los bugs originales del legacy (todos resueltos en esta migración), ver [`BUGS.md`](./BUGS.md).
