"""Punto de entrada FastAPI."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.models.content import (
    SiteSettings, Promotion, BlogPost, CatalogCategory, PremiumSection, PremiumCut,
)
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


SAMPLE_PRODUCTS = [
    dict(slug="lomo-fino-angus", name="Lomo Fino Angus", category=Category.res,
         description="Corte premium ideal para filetes, con marmoleo perfecto",
         price=32000, old_price=35500, image_url="/img/lomo-fino.jpg",
         rating=4, review_count=48, discount="-10%", tags="TOP VENTAS,ORIGEN ARGENTINA", stock=15),
    dict(slug="chuleta-cerdo", name="Chuleta de Cerdo", category=Category.cerdo,
         description="Corte fresco y jugoso, ideal para asar o freír",
         price=18500, old_price=21800, image_url="/img/chuleta-cerdo.jpg",
         rating=3, review_count=32, discount="-15%", tags="ANTIOQUIA", stock=20),
    dict(slug="pechuga-pollo-organico", name="Pechuga de Pollo Orgánico", category=Category.pollo,
         description="Pechuga deshuesada y sin piel, de crianza orgánica",
         price=12900, image_url="/img/pechuga-pollo.jpg",
         rating=5, review_count=65, tags="ORGÁNICO,SANTANDER", stock=30),
    dict(slug="carne-molida", name="Carne Molida Premium", category=Category.res,
         description="Mezcla 80/20 perfecta para hamburguesas y salsas",
         price=25600, image_url="/img/carne-molida.jpg",
         rating=4, review_count=41, tags="RECOMENDADO", stock=25),
    dict(slug="tomahawk", name="Tomahawk Steak", category=Category.res,
         description="Filete grueso con hueso, perfecto para parrilla",
         price=68000, old_price=77300, image_url="/img/tomahawk.jpg",
         rating=4.5, review_count=28, discount="-12%", tags="PREMIUM,NUEVO", stock=8),
    dict(slug="chorizos-artesanales", name="Chorizos Artesanales", category=Category.embutidos,
         description="Elaborados con especias seleccionadas",
         price=15800, image_url="/img/chorizos.jpg",
         rating=4, review_count=56, tags="RECETA TRADICIONAL", stock=40),
    dict(slug="costillas-bbq", name="Costillas BBQ", category=Category.cerdo,
         description="Marinadas en salsa BBQ casera, listas para asar",
         price=25900, old_price=31600, image_url="/img/costillas-bbq.jpg",
         rating=4, review_count=39, discount="-18%", tags="INCLUYE SALSA", stock=12),
    dict(slug="alitas-picantes", name="Alitas Picantes", category=Category.pollo,
         description="Marinadas en salsa picante artesanal",
         price=15500, image_url="/img/alitas-picantes.jpg",
         rating=4.5, review_count=47, tags="PICANTE MEDIO", stock=18),
]

# Los valores de abajo (promociones, recetas, categorias del catalogo, cortes
# premium) son los mismos que antes vivian hardcodeados en el navegador
# (frontend/src/lib/siteData.ts) — se migran tal cual para que el sitio no
# arranque vacio.

SAMPLE_PROMOTIONS = [
    dict(name="T-Bone Steak", price="$45.000", old_price="$70.300", unit_price=45000,
         off="36% OFF", color="bg-rojo", img="/img/t-bone.jpg"),
    dict(name="Costillas BBQ", price="$38.500", old_price="$62.100", unit_price=38500,
         off="38% OFF", color="bg-negro2", img="/img/costillas-bbq.jpg"),
    dict(name="Paquete Familiar", price="$89.900", old_price="$128.400", unit_price=89900,
         off="30% OFF", color="bg-azul", img="/img/paquete-familiar.jpg"),
    dict(name="Chorizos Artesanales", price="$15.800", old_price=None, unit_price=15800,
         off="ESPECIAL", color="bg-rojo", img="/img/chorizos.jpg"),
]

SAMPLE_BLOG_POSTS = [
    dict(title="Cómo cocinar la carne perfecta", date="15 Enero 2023",
         image="/img/blog-cocinar-carne.jpg",
         excerpt="Aprende los secretos para lograr el punto perfecto de cocción.",
         content=("<p>Lograr el punto perfecto de cocción es un arte que todo amante de la carne "
                   "debe dominar.</p><h4>🥩 Los puntos de cocción</h4><ul>"
                   "<li><strong>Rare:</strong> Rojo y tibio en el centro. 2-3 min por lado.</li>"
                   "<li><strong>Medium Rare:</strong> Rosa en el centro, jugoso. 3-4 min por lado.</li>"
                   "<li><strong>Well Done:</strong> Sin rosado. 5-6 min por lado.</li></ul>")),
    dict(title="Guía de cortes de carne", date="22 Febrero 2023",
         image="/img/blog-cortes.jpg",
         excerpt="Descubre los diferentes cortes y las mejores formas de prepararlos.",
         content=("<p>Conocer los diferentes cortes te ayuda a elegir el más adecuado para cada "
                   "preparación.</p><h4>🐄 Cortes de Res populares</h4><ul>"
                   "<li><strong>Lomo fino:</strong> Suave y magro, ideal para filetes.</li>"
                   "<li><strong>Tomahawk:</strong> Con hueso largo, espectacular para parrilla.</li>"
                   "<li><strong>Carne molida:</strong> Mezcla 80/20 para hamburguesas.</li></ul>")),
    dict(title="Técnicas para marinar carne", date="10 Marzo 2023",
         image="/img/blog-marinar.jpg",
         excerpt="Recetas y técnicas profesionales para marinar tus carnes.",
         content=("<p>Marinar correctamente transforma una carne ordinaria en algo extraordinario.</p>"
                   "<h4>🧄 Marinada básica universal</h4><ul>"
                   "<li>Aceite de oliva (base grasa)</li>"
                   "<li>Jugo de limón o vinagre (ácido)</li>"
                   "<li>Ajo machacado + hierbas frescas</li></ul>")),
    dict(title="Consejos para un asado perfecto", date="25 Marzo 2023",
         image="/img/blog-asado.jpg",
         excerpt="Desde el encendido del fuego hasta el corte final.",
         content=("<p>El asado es toda una ceremonia. Cada paso importa.</p>"
                   "<h4>🔥 El fuego correcto</h4><ul>"
                   "<li>Carbón de buena calidad o leña de maderas duras.</li>"
                   "<li>Brasas completamente encendidas — sin llama viva.</li></ul>")),
    dict(title="Higiene y manipulación de carne", date="2 Abril 2023",
         image="/img/blog-higiene.jpg",
         excerpt="Mantén la calidad y seguridad alimentaria con estos consejos.",
         content=("<p>La seguridad alimentaria no es opcional.</p>"
                   "<h4>❄️ Almacenamiento correcto</h4><ul>"
                   "<li><strong>Refrigerador (0-4°C):</strong> Carne fresca: 1-2 días.</li>"
                   "<li><strong>Congelador (-18°C):</strong> Res hasta 12 meses.</li></ul>")),
    dict(title="Receta casera de hamburguesas", date="10 Abril 2023",
         image="/img/blog-receta-hamburguesa.jpg",
         excerpt="Prepará hamburguesas jugosas y sabrosas desde cero.",
         content=("<p>Una hamburguesa perfecta empieza por la carne correcta.</p>"
                   "<h4>🛒 Ingredientes (4 hamburguesas)</h4><ul>"
                   "<li>500g de carne molida 80/20</li>"
                   "<li>1 cdita de sal gruesa</li>"
                   "<li>½ cdita de pimienta negra</li></ul>")),
]

SAMPLE_CATALOG_CATEGORIES = [
    dict(slug="res", label="Cortes de Res", css_class="from-rojo to-rojo-mid", image="/img/cat-res.svg"),
    dict(slug="cerdo", label="Cortes de Cerdo", css_class="from-pink-700 to-pink-900", image="/img/cat-cerdo.svg"),
    dict(slug="pollo", label="Cortes de Pollo", css_class="from-amber-600 to-amber-800", image="/img/cat-pollo.svg"),
    dict(slug="embutidos", label="Embutidos", css_class="from-orange-700 to-red-900", image="/img/cat-embutidos.svg"),
    dict(slug="pescado", label="Cortes de Pescado", css_class="from-azul to-azul-dark", image="/img/cat-pescado.svg"),
]

# dict ordenado: slug de la seccion -> sus columnas (el slug solo se usa para
# enlazar los cortes de abajo, no se guarda como tal en la tabla)
SAMPLE_PREMIUM_SECTIONS = {
    "res":   dict(title="Cortes de Res", icon="fa-cow", color="bg-rojo"),
    "cerdo": dict(title="Cortes de Cerdo", icon="fa-piggy-bank", color="bg-negro2"),
    "pollo": dict(title="Cortes de Pollo", icon="fa-drumstick-bite", color="bg-azul"),
}

SAMPLE_PREMIUM_CUTS = [
    dict(section_slug="res", name="Lomo Fino Angus", price="$32.000/kg", unit_price=32000,
         origin="Origen: Argentina", img="/img/lomo-fino.jpg", badge="TOP VENTAS", badge_color="bg-azul",
         text="Corte premium ideal para filetes, con marmoleo perfecto que garantiza terneza y sabor."),
    dict(section_slug="res", name="Tomahawk", price="$68.000/unidad", unit_price=68000,
         origin="Origen: Colombia", img="/img/tomahawk.jpg", badge="NUEVO", badge_color="bg-rojo",
         text="Filete grueso con hueso, perfecto para parrilla. Peso aproximado 1.2kg por unidad."),
    dict(section_slug="cerdo", name="Chuleta de Cerdo", price="$18.500/kg", unit_price=18500,
         origin="Origen: Antioquia", img="/img/chuleta-cerdo.jpg", badge="-15%", badge_color="bg-rojo",
         text="Corte fresco y jugoso, ideal para asar o freír. Presentación en paquetes de 1kg."),
    dict(section_slug="cerdo", name="Costillas BBQ", price="$25.900/paquete", unit_price=25900,
         origin="Origen: Valle", img="/img/costillas-bbq.jpg", badge="RECOMENDADO", badge_color="bg-azul",
         text="Paquete de costillas marinadas listas para la parrilla. Incluye salsa BBQ artesanal."),
    dict(section_slug="pollo", name="Pechuga de Pollo", price="$12.900/bandeja", unit_price=12900,
         origin="Origen: Santander", img="/img/pechuga-pollo.jpg", badge="ORGÁNICO", badge_color="bg-negro2",
         text="Pechuga deshuesada y sin piel, de crianza orgánica. Bandeja de 500g."),
    dict(section_slug="pollo", name="Alitas Picantes", price="$15.500/paquete", unit_price=15500,
         origin="Origen: Cundinamarca", img="/img/alitas-picantes.jpg", badge="ESPECIAL", badge_color="bg-azul",
         text="Alitas marinadas en salsa picante artesanal, listas para hornear. Paquete de 1kg."),
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
            print(f"[seed] admin creado -> {settings.FIRST_ADMIN_USERNAME} / {settings.FIRST_ADMIN_PASSWORD}")

        # productos
        if db.query(Product).count() == 0:
            for p in SAMPLE_PRODUCTS:
                db.add(Product(**p))
            db.commit()
            print(f"[seed] {len(SAMPLE_PRODUCTS)} productos demo cargados")

        # contenido del sitio (antes vivia solo en localStorage del navegador)
        if db.query(SiteSettings).count() == 0:
            db.add(SiteSettings(
                id=1,
                banner_subtitle="La mejor carne de la ciudad",
                banner_title="100% Natural",
                banner_highlight="Carne Premium",
                banner_cta_text="Ver catálogo",
                banner_cta_href="#products",
                footer_address="Carrera 76 #20f-107, Barrio París, Medellín",
                footer_phone="316 401 3230",
                footer_email="contacto@fuentedevida.co",
                footer_whatsapp_number="573164013230",
                footer_schedule_week="Lunes a Sábado: 7am – 8pm",
                footer_schedule_sunday="Domingos: 8am – 2pm",
                footer_copyright="Carnicería Expendio Fuente de Vida — Todos los derechos reservados.",
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
            print(f"[seed] {len(SAMPLE_BLOG_POSTS)} recetas/articulos demo cargados")

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
                db.flush()  # asigna section.id para los cortes
                section_ids[slug] = section.id
            for i, c in enumerate(SAMPLE_PREMIUM_CUTS):
                section_slug = c.pop("section_slug")
                db.add(PremiumCut(sort_order=i, section_id=section_ids.get(section_slug), **c))
            db.commit()
            print(f"[seed] {len(SAMPLE_PREMIUM_SECTIONS)} secciones y {len(SAMPLE_PREMIUM_CUTS)} cortes premium demo cargados")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # El esquema lo crea Alembic (alembic upgrade head, ver docker-compose.yml);
    # aqui solo se insertan datos.
    seed_data()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.2.0",
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


@app.get("/", tags=["health"])
def root():
    return {"app": settings.APP_NAME, "version": "0.2.0", "status": "ok"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
