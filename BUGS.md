# Bugs y Errores Detectados — Carnicería Fuente de Vida / INCODOL

> Auditoría del código legacy (HTML/CSS/JS plano) antes de migrar a **FastAPI + Next.js**.
> Última revisión: 26 de abril de 2026.

---

## Leyenda

- **CRÍTICO** — rompe funcionalidad o impide despliegue.
- **ALTO** — bug visible o de seguridad importante.
- **MEDIO** — comportamiento incorrecto pero no bloqueante.
- **BAJO** — mejora o limpieza recomendada.

---

## 1. Public/index.html (sitio público)

### CRÍTICO
- **C1 (línea 743-744): HTML mal formado en el footer.** Hay una etiqueta `</` huérfana y un `</div>` extra dentro de `.services`. Rompe el árbol DOM.
- **C2 (líneas 12-14, 807): Rutas con mayúsculas inconsistentes.** El HTML enlaza `./css/styles.css` y `./js/script.js` pero las carpetas reales son `CSS/` y `JS/`. Funciona en Windows pero **falla 404 en Linux/Vercel/cualquier hosting real**.
- **C3 (líneas 130-150, 167+): Imágenes inexistentes.** Se referencian `img/lomo-fino.jpg`, `img/gallery1.jpg`, `img/blog-*.jpg`, etc. La carpeta `img/` no existe en `Public/`. Catálogo, galería, blog y promos saldrán rotos.

### ALTO
- **A1 (línea 713): Email ofuscado por Cloudflare** en código copiado: `<a href="/cdn-cgi/l/email-protection" class="__cf_email__" ...>`. Residuo de un sitio que pasó por Cloudflare. Reemplazar por `mailto:` real.
- **A2 (script.js líneas 110-127): `searchForm` y `searchInput` no existen en el HTML.** Listener muerto.
- **A3 (script.js líneas 274-279): `#btn-wpp-header` tampoco existe.** Mismo problema.

### MEDIO
- **M1 (línea 448): `data-name` incorrecto en chuleta de cerdo premium.** El botón dice "Chuleta de Cerdo" pero `data-name="Costillas BBQ"`. Añade el producto equivocado al carrito.
- **M2 (líneas 489, 505): Mismo bug en pechuga de pollo y alitas.** Botón "Pechuga de Pollo" tiene `data-name="Alitas Picantes"`.
- **M3 (líneas 169, 197, 277, 331): `</div>` desalineados en `.container-img`.** Indentación incorrecta.
- **M4 (líneas 122-125): Categoría "pescado" sin productos en catálogo.** Aparece como card pero no hay ningún `card-product` con `data-category="pescado"`.
- **M5 (líneas 158-162): Filtro "embutidos" no está como tab.** El catálogo tiene chorizos pero el usuario nunca puede filtrar a esa categoría.

### BAJO
- **B1: Indentación mezclada (tabs y espacios).**
- **B2 (línea 9): Falta `<meta name="description">` y Open Graph tags.**

---

## 2. Public/JS/script.js

### ALTO
- **A4 (línea 186): Carrito en memoria — se pierde al recargar.** Migrar a localStorage o backend.
- **A5 (línea 269): `alert()` para validación.** Reemplazar por toast en React.

### MEDIO
- **M6 (líneas 110-127): Selectores de elementos inexistentes.** Ver A2.

---

## 3. Admin/SEGU/index.html (login INCODOL)

### CRÍTICO
- **C4 (línea 134): Redirección post-login comentada.** `// setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);`. Al iniciar sesión correcto el usuario nunca va al dashboard.
- **C5 (línea 75): Backend hardcodeado a `localhost:4000`.** No hay variable de entorno; en producción habrá que editar el HTML.

### ALTO
- **A6 (línea 75): HTTP en vez de HTTPS** en producción dejaría las credenciales en claro.
- **A7: No hay backend Python en el repo.** `app.py` (mencionado en `reset_password.html` línea 168) no existe. El login no puede probarse.
- **A8 (líneas 100-165): Token JWT no se guarda.** El `data.success` se valida pero nunca se almacena un token. Sin sesión persistente.

### MEDIO
- **M7 (líneas 28-32): Sin validación de longitud/complejidad de contraseña.** Solo `required`.
- **M8 (líneas 104-105): `.trim()` aplicado a la contraseña.** Algunos usuarios usan espacios intencionalmente.

---

## 4. Admin/SEGU/reset_password.html

### CRÍTICO
- **C6 (línea 95): Mismo backend hardcodeado** `http://localhost:4000/reset-password`.
- **C7 (línea 168): Mensaje de error filtra implementación.** `"¿Está corriendo app.py?"` expone detalles técnicos al usuario final.

### MEDIO
- **M9: Código duplicado con index.html.** Funciones `mostrarError` y lógica de versión copiadas. Al migrar a React → componente reutilizable.

---

## 5. Admin/dash/admin.html

### ALTO
- **A9: Sin protección de ruta.** Si alguien conoce la URL `admin.html` accede sin autenticación.
- **A10: CSS gigante inline.** Todo el CSS del dashboard en `<style>` dentro del HTML. Difícil de mantener.

---

## 6. Estructura general / DevOps

### CRÍTICO
- **G1: No hay `.gitignore`.** Riesgo de subir `node_modules/`, `.env`, `__pycache__/`.
- **G2: No hay backend.** El frontend asume Flask en `localhost:4000` pero no está en este repo.
- **G3: No hay `package.json` ni `requirements.txt`.** Imposible reproducir el entorno.

### ALTO
- **G4: Sin variables de entorno.** URLs y secretos hardcodeados.
- **G5: Sin CORS configurado.**
- **G6: Sin sistema de build/bundling.** Sin minificación, sin cache busting.

### MEDIO
- **G7: Estructura de carpetas inconsistente.** `Public/CSS`, `Admin/SEGU`, mezcla mayúsculas/minúsculas y español/inglés.
- **G8: Sin tests.**

---

## Resumen de prioridades para la migración

1. **Reemplazar todo el stack** → FastAPI + Next.js (en curso). Esto resuelve automáticamente: C1, C2, C5, C6, A1–A8, A9–A10, G1–G8.
2. **Conservar el diseño visual** del login INCODOL y de la home pública.
3. **Resolver bugs de datos** (M1, M2, M4, M5) durante la reescritura.
4. **Agregar las imágenes faltantes** (C3) — pendiente del cliente o usar placeholders.
5. **Implementar JWT real** con roles (admin / vendedor / cliente).

---

*Este documento se mantiene como referencia histórica. Los bugs aquí listados se resuelven en el nuevo stack ubicado en `/backend` y `/frontend`.*
