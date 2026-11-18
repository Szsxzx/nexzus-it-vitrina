"""Punto de entrada FastAPI — NEXZUS IT SERVICE."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.content import (
    SiteSettings, Promotion, BlogPost, CatalogCategory, PremiumSection, PremiumCut,
)
from app.models import pqr as _pqr_models  # noqa: F401  (registra la tabla pqrs)
from app.routers import auth as auth_router
from app.routers import products as products_router
from app.routers import orders as orders_router
from app.routers import users as users_router
from app.routers import dashboard as dashboard_router
from app.routers import settings as settings_router
from app.routers import promotions as promotions_router
from app.routers import blog as blog_router
from app.routers import catalog as catalog_router
from app.routers import premium as premium_router
from app.routers import payments as payments_router
from app.routers import pqr as pqr_router


# Datos demo. Solo se insertan si la tabla correspondiente esta vacia: una BD que
# ya tenga contenido (p. ej. la de la antigua carniceria) no se toca.
# Imagenes: /img/products/<slug>.svg y /img/cat-<slug>.svg (las sirve el frontend).

SAMPLE_PRODUCTS = [
    dict(slug="portatil-empresarial", name="Portátil empresarial 15 pulgadas", category="hardware",
         description="Core i7, 16 GB RAM, SSD 512 GB. Pensado para jornada completa de oficina.",
         price=3890000, old_price=4290000, image_url="/img/products/portatil-empresarial.svg",
         rating=4.5, review_count=38, discount="-9%", tags="GARANTÍA 1 AÑO", stock=12),
    dict(slug="pc-escritorio", name="PC de escritorio All-in-One", category="hardware",
         description="Equipo compacto para puestos de trabajo, con teclado y mouse incluidos.",
         price=2950000, image_url="/img/products/pc-escritorio.svg",
         rating=4, review_count=21, tags="LISTO PARA USAR", stock=10),
    dict(slug="servidor-rack", name="Servidor rack 1U", category="hardware",
         description="Servidor para virtualización y archivos, con fuente redundante.",
         price=12500000, image_url="/img/products/servidor-rack.svg",
         rating=5, review_count=9, tags="INSTALACIÓN OPCIONAL", stock=3),
    dict(slug="monitor-27", name="Monitor 27 pulgadas IPS", category="accesorios",
         description="Panel IPS Full HD con ajuste de altura y entrada HDMI/DisplayPort.",
         price=890000, image_url="/img/products/monitor-27.svg",
         rating=4.5, review_count=52, tags="IPS", stock=20),
    dict(slug="switch-24", name="Switch gestionable 24 puertos", category="redes",
         description="Gigabit con VLAN y PoE+, para redes de oficina en crecimiento.",
         price=1650000, image_url="/img/products/switch-24.svg",
         rating=4, review_count=14, tags="POE+", stock=8),
    dict(slug="router-wifi6", name="Router Wi-Fi 6 empresarial", category="redes",
         description="Doble banda, múltiples SSID y administración centralizada.",
         price=520000, old_price=590000, image_url="/img/products/router-wifi6.svg",
         rating=4, review_count=27, discount="-12%", tags="WI-FI 6", stock=15),
    dict(slug="licencia-windows-pro", name="Licencia Windows 11 Pro", category="licencias",
         description="Licencia original con activación digital y factura a nombre de su empresa.",
         price=690000, image_url="/img/products/licencia-windows-pro.svg",
         rating=5, review_count=61, tags="ENTREGA DIGITAL", stock=100),
    dict(slug="microsoft-365", name="Microsoft 365 Empresa", category="software",
         description="Suscripción anual por usuario: Office, correo y almacenamiento en la nube.",
         price=520000, image_url="/img/products/microsoft-365.svg",
         rating=4.5, review_count=44, tags="ANUAL", stock=100),
    dict(slug="antivirus-empresarial", name="Antivirus empresarial (10 equipos)", category="software",
         description="Protección de endpoints con consola centralizada y soporte técnico.",
         price=480000, image_url="/img/products/antivirus-empresarial.svg",
         rating=4, review_count=33, tags="1 AÑO", stock=100),
    dict(slug="erp-pyme", name="ERP para pymes", category="software",
         description="Facturación, inventario y contabilidad con implementación guiada.",
         price=2400000, image_url="/img/products/erp-pyme.svg",
         rating=4.5, review_count=12, tags="CON IMPLEMENTACIÓN", stock=100),
    dict(slug="teclado-mouse", name="Combo teclado y mouse inalámbrico", category="accesorios",
         description="Conexión por receptor USB, batería de larga duración, distribución en español.",
         price=120000, image_url="/img/products/teclado-mouse.svg",
         rating=4, review_count=70, tags="INALÁMBRICO", stock=40),
    dict(slug="ups-1500", name="UPS 1500 VA", category="accesorios",
         description="Respaldo de energía para equipos y red, con regulación de voltaje.",
         price=780000, image_url="/img/products/ups-1500.svg",
         rating=4.5, review_count=19, tags="8 TOMAS", stock=18),
]

SAMPLE_PROMOTIONS = [
    dict(name="Combo oficina: portátil + Microsoft 365", price="$4.190.000", old_price="$4.410.000",
         unit_price=4190000, off="5% OFF", color="bg-primary",
         img="/img/products/portatil-empresarial.svg"),
    dict(name="Antivirus empresarial 10 equipos", price="$399.000", old_price="$480.000",
         unit_price=399000, off="17% OFF", color="bg-accent",
         img="/img/products/antivirus-empresarial.svg"),
    dict(name="Kit de red para pyme (router + switch)", price="$1.990.000", old_price="$2.170.000",
         unit_price=1990000, off="8% OFF", color="bg-secondary",
         img="/img/products/router-wifi6.svg"),
    dict(name="Combo teclado y mouse inalámbrico", price="$99.000", old_price=None,
         unit_price=99000, off="ESPECIAL", color="bg-primary",
         img="/img/products/teclado-mouse.svg"),
]

SAMPLE_BLOG_POSTS = [
    dict(title="Cómo elegir el portátil adecuado para tu empresa", date="3 Noviembre 2026",
         image="/img/cat-hardware.svg",
         excerpt="Procesador, memoria, almacenamiento y garantía: lo que de verdad importa al comprar equipos.",
         content=("<p>Comprar equipos para un equipo de trabajo no es lo mismo que comprar uno para casa.</p>"
                  "<h4>Lo que conviene revisar</h4><ul>"
                  "<li><strong>Memoria:</strong> 16 GB evita que el equipo se quede corto en dos o tres años.</li>"
                  "<li><strong>Almacenamiento:</strong> SSD siempre; 512 GB es un buen punto de partida.</li>"
                  "<li><strong>Garantía:</strong> busca soporte en sitio o reemplazo rápido.</li></ul>")),
    dict(title="Licencias de software: por qué evitar las copias no oficiales", date="20 Octubre 2026",
         image="/img/cat-licencias.svg",
         excerpt="Riesgos legales y de seguridad de usar software sin licencia en una empresa.",
         content=("<p>El software sin licencia expone a la empresa a sanciones y a malware.</p>"
                  "<h4>Ventajas de licenciar</h4><ul>"
                  "<li>Actualizaciones de seguridad a tiempo.</li>"
                  "<li>Soporte del fabricante.</li>"
                  "<li>Cumplimiento ante auditorías.</li></ul>")),
    dict(title="Red Wi-Fi para oficinas: 5 errores comunes", date="6 Octubre 2026",
         image="/img/cat-redes.svg",
         excerpt="Cobertura, seguridad y segmentación: cómo tener una red estable en la oficina.",
         content=("<p>Una red mal diseñada se nota todos los días en videollamadas y archivos lentos.</p>"
                  "<h4>Errores frecuentes</h4><ul>"
                  "<li>Usar el router del operador para toda la oficina.</li>"
                  "<li>No separar la red de invitados.</li>"
                  "<li>Dejar contraseñas por defecto en los equipos de red.</li></ul>")),
    dict(title="Copias de seguridad: la regla 3-2-1", date="22 Septiembre 2026",
         image="/img/cat-software.svg",
         excerpt="Una estrategia simple para no perder la información de tu negocio.",
         content=("<p>La regla 3-2-1 es la base de cualquier plan de respaldo.</p>"
                  "<h4>En qué consiste</h4><ul>"
                  "<li><strong>3</strong> copias de los datos.</li>"
                  "<li><strong>2</strong> medios de almacenamiento distintos.</li>"
                  "<li><strong>1</strong> copia fuera de la oficina o en la nube.</li></ul>")),
]

SAMPLE_CATALOG_CATEGORIES = [
    dict(slug="software", label="Software", css_class="from-primary to-secondary", image="/img/cat-software.svg"),
    dict(slug="hardware", label="Hardware", css_class="from-accent to-primary", image="/img/cat-hardware.svg"),
    dict(slug="licencias", label="Licencias", css_class="from-primary to-secondary", image="/img/cat-licencias.svg"),
    dict(slug="redes", label="Redes", css_class="from-accent to-primary", image="/img/cat-redes.svg"),
    dict(slug="accesorios", label="Accesorios", css_class="from-primary to-secondary", image="/img/cat-accesorios.svg"),
]

# "Soluciones destacadas" (tablas premium_sections / premium_cuts). El slug solo
# se usa para enlazar los items de abajo, no se guarda en la tabla.
SAMPLE_PREMIUM_SECTIONS = {
    "software": dict(title="Software empresarial", icon="fa-laptop-code", color="bg-primary"),
    "infraestructura": dict(title="Infraestructura y servidores", icon="fa-server", color="bg-secondary"),
    "redes": dict(title="Redes y conectividad", icon="fa-network-wired", color="bg-accent"),
}

SAMPLE_PREMIUM_CUTS = [
    dict(section_slug="software", name="ERP para pymes", price="$2.400.000", unit_price=2400000,
         origin="Implementación guiada", img="/img/products/erp-pyme.svg",
         badge="RECOMENDADO", badge_color="bg-accent",
         text="Facturación, inventario y contabilidad en una sola plataforma, con capacitación inicial."),
    dict(section_slug="software", name="Microsoft 365 Empresa", price="$520.000/año", unit_price=520000,
         origin="Suscripción por usuario", img="/img/products/microsoft-365.svg",
         badge="ANUAL", badge_color="bg-primary",
         text="Office, correo corporativo y almacenamiento en la nube, con migración de buzones."),
    dict(section_slug="infraestructura", name="Servidor rack 1U", price="$12.500.000", unit_price=12500000,
         origin="Instalación en sitio", img="/img/products/servidor-rack.svg",
         badge="LLAVE EN MANO", badge_color="bg-secondary",
         text="Servidor para virtualización y archivos, con configuración de usuarios y copias de seguridad."),
    dict(section_slug="infraestructura", name="UPS 1500 VA", price="$780.000", unit_price=780000,
         origin="Entrega en Bogotá", img="/img/products/ups-1500.svg",
         badge="PROTECCIÓN", badge_color="bg-primary",
         text="Mantén servidores y equipos de red funcionando durante cortes de energía."),
    dict(section_slug="redes", name="Kit de red para oficina", price="$1.990.000", unit_price=1990000,
         origin="Instalación incluida", img="/img/products/router-wifi6.svg",
         badge="COMBO", badge_color="bg-accent",
         text="Router Wi-Fi 6 y switch gestionable de 24 puertos, configurados y documentados."),
    dict(section_slug="redes", name="Switch gestionable 24 puertos", price="$1.650.000", unit_price=1650000,
         origin="Montaje en rack", img="/img/products/switch-24.svg",
         badge="POE+", badge_color="bg-secondary",
         text="Segmenta tu red con VLAN y alimenta cámaras y access points por PoE+."),
]


def seed_data() -> None:
    db = SessionLocal()
    try:
        # admin
        if db.query(User).count() == 0:
            db.add(User(
                username=settings.FIRST_ADMIN_USERNAME,
                email=settings.FIRST_ADMIN_EMAIL,
                full_name="Administrador",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.admin,
                is_active=True,
            ))
            db.commit()
            print(f"[seed] admin creado -> {settings.FIRST_ADMIN_USERNAME}")

        # productos
        if db.query(Product).count() == 0:
            for p in SAMPLE_PRODUCTS:
                db.add(Product(**p))
            db.commit()
            print(f"[seed] {len(SAMPLE_PRODUCTS)} productos demo cargados")

        # contenido del sitio. Contacto y NIT son PLACEHOLDERS: editarlos desde el panel.
        if db.query(SiteSettings).count() == 0:
            db.add(SiteSettings(
                id=1,
                banner_subtitle="Software, hardware y soporte IT para empresas en Colombia",
                banner_title="NEXZUS IT SERVICE",
                banner_highlight="Tecnología que impulsa tu negocio",
                banner_cta_text="Ver tienda",
                banner_cta_href="/tienda",
                footer_address="Bogotá, Colombia",
                footer_phone="+57 300 000 0000",
                footer_email="contacto@nexzusit.com",
                footer_whatsapp_number="573000000000",
                footer_schedule_week="Lunes a viernes: 8:00 a. m. – 6:00 p. m.",
                footer_schedule_sunday="Sábados: 9:00 a. m. – 1:00 p. m.",
                footer_copyright="NEXZUS IT SERVICE · NIT 000.000.000-0 — Todos los derechos reservados.",
            ))
            db.commit()
            print("[seed] configuracion del sitio (banner/footer/whatsapp) cargada")

        if db.query(Promotion).count() == 0:
            for i, p in enumerate(SAMPLE_PROMOTIONS):
                db.add(Promotion(sort_order=i, **p))
            db.commit()
            print(f"[seed] {len(SAMPLE_PROMOTIONS)} promociones demo cargadas")

        if db.query(BlogPost).count() == 0:
            for i, p in enumerate(SAMPLE_BLOG_POSTS):
                db.add(BlogPost(sort_order=i, **p))
            db.commit()
            print(f"[seed] {len(SAMPLE_BLOG_POSTS)} articulos demo cargados")

        if db.query(CatalogCategory).count() == 0:
            for i, c in enumerate(SAMPLE_CATALOG_CATEGORIES):
                db.add(CatalogCategory(sort_order=i, **c))
            db.commit()
            print(f"[seed] {len(SAMPLE_CATALOG_CATEGORIES)} categorias de catalogo demo cargadas")

        if db.query(PremiumSection).count() == 0:
            section_ids: dict[str, int] = {}
            for i, (slug, s) in enumerate(SAMPLE_PREMIUM_SECTIONS.items()):
                section = PremiumSection(sort_order=i, **s)
                db.add(section)
                db.flush()  # asigna section.id para los items
                section_ids[slug] = section.id
            for i, c in enumerate(SAMPLE_PREMIUM_CUTS):
                c = dict(c)
                section_slug = c.pop("section_slug")
                db.add(PremiumCut(sort_order=i, section_id=section_ids.get(section_slug), **c))
            db.commit()
            print(f"[seed] {len(SAMPLE_PREMIUM_SECTIONS)} soluciones destacadas y {len(SAMPLE_PREMIUM_CUTS)} items demo cargados")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # El esquema lo crea Alembic (alembic upgrade head); aqui solo se insertan datos.
    seed_data()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.3.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router.router)
app.include_router(products_router.router)
app.include_router(orders_router.router)
app.include_router(users_router.router)
app.include_router(dashboard_router.router)
app.include_router(settings_router.router)
app.include_router(promotions_router.router)
app.include_router(blog_router.router)
app.include_router(catalog_router.router)
app.include_router(premium_router.router)
app.include_router(payments_router.router)
app.include_router(pqr_router.router)


@app.get("/", tags=["health"])
def root():
    return {"app": settings.APP_NAME, "version": "0.3.0", "status": "ok"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
