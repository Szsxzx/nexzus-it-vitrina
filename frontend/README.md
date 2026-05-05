# INCODOL — Frontend (Next.js 14)

Frontend público + panel admin de la **Carnicería Fuente de Vida**.
Stack: **Next.js 14 (App Router) + React 18 + TypeScript + Tailwind**.

## 1. Requisitos
- Node.js 18.18+ (recomendado 20+)
- npm 10+ (o pnpm/yarn)

## 2. Instalación
```bash
cd frontend
npm install
cp .env.example .env.local        # editar la URL del backend
```

## 3. Arrancar en desarrollo
```bash
npm run dev
```
- Web pública: <http://localhost:3000>
- Panel admin: <http://localhost:3000/admin/login>
  - Credenciales seed (definidas en `backend/.env`): **admin / Admin123!**
- Reset password: <http://localhost:3000/admin/reset-password>

> ⚠️ El backend FastAPI debe estar corriendo en `http://localhost:4000`
> (ver `../backend/README.md`).

## 4. Build de producción
```bash
npm run build && npm start
```

## 5. Estructura
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz (fonts, metadata)
│   │   ├── page.tsx                # Home pública
│   │   └── admin/
│   │       ├── login/page.tsx      # Login INCODOL
│   │       ├── reset-password/     # Recuperar contraseña
│   │       └── dashboard/page.tsx  # Panel (placeholder)
│   ├── components/                 # SiteHeader, Banner, Catalog, ...
│   ├── lib/
│   │   ├── api.ts                  # Cliente fetch contra FastAPI
│   │   ├── cart.tsx                # Context del carrito (localStorage)
│   │   ├── types.ts
│   │   └── data/                   # Productos y blogs (mock — luego del backend)
│   └── styles/globals.css
├── public/img/                     # ← coloca aquí las fotos
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## 6. Bugs del legacy ya corregidos en esta migración
- ✅ HTML del footer mal formado → JSX validado.
- ✅ Rutas case-sensitive → ya no aplica.
- ✅ Email ofuscado de Cloudflare → reemplazado por `mailto:` real.
- ✅ Botones premium con `data-name` cruzado (M1, M2) → cada botón añade el producto correcto.
- ✅ Filtro "embutidos" faltante (M5) → añadido.
- ✅ Selectores muertos `#search-form`, `#btn-wpp-header` (A2, A3) → eliminados.
- ✅ Carrito en memoria (A4) → migrado a `localStorage`.
- ✅ `alert()` para errores (A5) → toast/banner visual.
- ✅ Login sin redirección post-success (C4) → `router.push("/admin/dashboard")`.
- ✅ JWT no almacenado (A8) → token guardado en `localStorage` y enviado vía `Authorization: Bearer`.
- ✅ Mensaje "¿Está corriendo app.py?" (C7) → "El servicio no está disponible".
- ✅ Backend hardcodeado (C5, C6) → variable `NEXT_PUBLIC_API_URL` en `.env.local`.
- ✅ Dashboard sin protección (A9) → guard de ruta + `GET /auth/me` al cargar.

## 7. Pendiente (próximos sprints)
- Reemplazar `src/lib/data/products.ts` por llamadas al backend (`/products`).
- Módulos de productos, pedidos y reportes en `/admin/dashboard`.
- Subir imágenes reales a `public/img/`.
- Confirmar email del usuario (verificación por correo).
- Dockerizar backend + frontend con `docker-compose`.
