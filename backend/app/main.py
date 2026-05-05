"""Punto de entrada FastAPI."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.routers import auth as auth_router
from app.routers import products as products_router
from app.routers import orders as orders_router
from app.routers import users as users_router
from app.routers import dashboard as dashboard_router


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
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
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


@app.get("/", tags=["health"])
def root():
    return {"app": settings.APP_NAME, "version": "0.2.0", "status": "ok"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
