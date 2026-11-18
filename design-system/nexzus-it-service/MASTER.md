# NEXZUS IT SERVICE — Design System (MASTER)

Fuente: skill `ui-ux-pro-max` (datos `products.csv` #5 "B2B Service", `colors.csv` #5, `typography.csv` #16 "Corporate Trust").
Las páginas en `pages/` sobrescriben estas reglas cuando existan.

## Decisión final (2026-11-17)
El cliente probó tres versiones del home y **eligió la primera** (hero oscuro con el logo, franja de
beneficios, servicios en bento, bloque oscuro de "por qué elegirnos" con cifras, marcas, reseñas, PQR y contacto).
Es la que está en `frontend/src/components/home/`. Las notas de abajo quedan como contexto de la iteración;
no rehacer el home sin que el cliente lo pida. Las cifras (+500, +120…) son placeholders: reemplazarlas por datos reales.

## Dirección visual (feedback del cliente, 2026-11-17)
- La marca es **neutra, tranquila, relajada**. Nada de alboroto: sin grids de fondo, glows, degradados llamativos,
  badges/píldoras por todas partes, ni íconos en cada línea.
- Debe sentirse **real y confiable**, no plantilla de startup: nada de cifras infladas ("+500", "100%") ni
  afirmaciones sin respaldo. Mejor compromisos concretos y verificables.
- Base clara: blanco y gris muy suave. El negro para texto y, como mucho, el footer. El morado SOLO como acento
  puntual (botón principal, links, un detalle). Mucho espacio en blanco, pocas secciones bien resueltas.
- La **tienda** (`/tienda`) conserva exactamente el diseño original del repo; solo cambian colores y textos.
- Ajuste 2 del cliente: la versión ultra-minimal quedó "muy simple". Buscar el punto medio: **diseño hermoso y
  estético, con visuales acoplados a lo que se muestra** (equipos, licencias, redes, soporte: productos reales del
  catálogo, ilustraciones de producto, composiciones con tarjetas), **pero sin exagerar ni parecer hecho con IA**.
- Señales de "hecho con IA" a evitar: texto con degradado, orbes/glows, grids de fondo, cifras redondas infladas,
  píldoras en todo, emojis, todo centrado y simétrico, 3 tarjetas idénticas con ícono arriba en cada sección,
  frases de marketing vacías. Preferir: composición asimétrica, jerarquía editorial, imágenes de producto,
  un solo bloque oscuro bien usado, detalles finos (bordes 1px, números de paso, etiquetas pequeñas).

## Producto
- Tipo: B2B Service + e-commerce de tecnología (venta de software y hardware), Colombia.
- Tono: corporativo, sobrio, confiable. Credibilidad antes que espectáculo.
- Estilo: Accessible & Ethical + Minimalism / Swiss. Grid tipo bento para servicios. Micro-interacciones discretas.

## Color (tokens semánticos)
Colores de marca: **negro y morado** (logo oficial en `frontend/public/img/logo-nexzus.png`).
Estructura de la paleta B2B de la skill (oscuro dominante + un acento para CTA) con los valores de la marca.

| Token | Hex | Uso |
|---|---|---|
| primary | `#0B0712` | Negro de marca (ligeramente violáceo): header, footer, hero, títulos |
| on-primary | `#FFFFFF` | Texto sobre primary |
| secondary | `#1A1030` | Morado muy oscuro: superficies oscuras secundarias, degradados del hero |
| accent | `#7C3AED` | Morado de marca: botones de acción, links, foco (5.7:1 sobre blanco) |
| accent-hover | `#6D28D9` | Hover del accent |
| accent-light | `#A78BFA` | Morado claro: texto/íconos de acento SOBRE fondos oscuros |
| accent-soft | `#EDE9FE` | Fondos suaves de badges/íconos sobre claro |
| background | `#F8F7FB` | Fondo de página (blanco con matiz lavanda) |
| foreground | `#0B0712` | Texto principal |
| card | `#FFFFFF` | Tarjetas |
| muted | `#EEEBF5` | Superficies apagadas |
| muted-foreground | `#4B4560` | Texto secundario (contraste AA sobre blanco) |
| border (`line`) | `#E4E0EE` | Bordes 1px |
| destructive | `#DC2626` | Errores, estado rechazado |
| success | `#15803D` | Pago aprobado, PQR respondida |
| warning | `#B45309` | Pendiente / en trámite |

Prohibido: hex sueltos en componentes (usar clases Tailwind de los tokens), rojo, azul como color de marca, neón, glows exagerados.
Degradados permitidos solo sutiles y de marca: `from-primary to-secondary` (fondos oscuros) y `from-accent to-accent-hover`.
Secciones oscuras (hero, franja de cifras, footer) alternan con secciones claras para mantener el tono corporativo.

## Tipografía
- Títulos: **Lexend** 500/600/700. Cuerpo: **Source Sans 3** 400/500/600.
- Base 16px, line-height 1.5–1.6. Títulos con tracking ligeramente negativo.
- Escala: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48.

## Layout y componentes
- Contenedor máx. 1200px (`max-w-6xl`), gutter 16px móvil / 24px desktop. Mobile-first, sin scroll horizontal.
- Radios: 8px controles, 12px tarjetas. Sombras suaves (`shadow-sm`, hover `shadow-md`).
- Tarjetas blancas con borde 1px `border`, hover: elevación ligera + borde accent, 150–200ms.
- Botones: primario `accent` / secundario contorno navy. Altura mínima 44px.
- Íconos: SVG/Font Awesome consistentes, nunca emoji como ícono.
- Formularios: label visible siempre, error junto al campo, texto de ayuda, estado de carga en el botón.

## Movimiento
- 150–300ms, ease-out. Respetar `prefers-reduced-motion` (ya existe soporte en `Reveal.tsx`).
- No animar width/height; usar transform/opacity.

## Accesibilidad (crítico)
- Contraste ≥ 4.5:1. Foco visible (`ring-2 ring-accent`). `aria-label` en botones solo-ícono.
- Navegación por teclado completa. `alt` en todas las imágenes.

## Anti-patrones a evitar
- Estética de "carnicería" (rojos, serif decorativa Cormorant), emoji, textos de relleno genéricos,
  testimonios falsos presentados como reales sin marcarlos como contenido de ejemplo editable.
