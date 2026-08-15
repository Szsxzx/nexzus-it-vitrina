"""
Test end-to-end del backend INCODOL.

Cubre:
- /health
- /auth/login (admin)
- /auth/register (cliente nuevo)
- /auth/me
- /products GET y CRUD (admin)
- /orders POST (publico) y GET (admin)
- /orders/:id/status (admin)
- /users GET (admin) y PATCH
- /dashboard/stats (admin)
- /settings GET (publico) y PATCH (admin)
- /promotions, /blog-posts, /catalog-categories CRUD (admin) + lectura publica
- /premium-sections, /premium-cuts CRUD (admin), incluyendo que borrar una
  seccion no borra sus cortes, solo los desvincula
- Roles: cliente NO puede crear productos / listar usuarios / escribir contenido

Uso:
    cd backend
    python -m pytest test_e2e.py -v
    # o simplemente
    python test_e2e.py
"""
import os
import sys
import tempfile

# Aislar la BD
TMP_DB = os.path.join(tempfile.gettempdir(), "incodol_test_e2e.db")
if os.path.exists(TMP_DB):
    os.remove(TMP_DB)
os.environ["DATABASE_URL"] = f"sqlite:///{TMP_DB}"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["FIRST_ADMIN_PASSWORD"] = "Admin123!"

# Asegurar que la app importe desde la carpeta backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient   # noqa: E402
from app.core.database import Base, engine  # noqa: E402
from app.models import user, product, content  # noqa: E402,F401  (registra las tablas en Base.metadata)
from app.main import app                    # noqa: E402

# En produccion el esquema lo crea Alembic (ver docker-compose.yml); aqui, sobre
# el sqlite temporal, create_all es el atajo correcto — no tiene sentido migrar
# un archivo que se borra al terminar el test.
Base.metadata.create_all(bind=engine)

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"
results = []


def check(name, cond, detail=""):
    label = PASS if cond else FAIL
    results.append((name, cond))
    extra = f" -- {detail}" if detail else ""
    print(f"  [{label}] {name}{extra}")
    return cond


def main() -> int:
    print("\n=== INCODOL Backend - Tests E2E ===\n")
    with TestClient(app) as c:
        # ---------- Health ----------
        print("[1] Health")
        r = c.get("/health")
        check("GET /health 200", r.status_code == 200 and r.json()["status"] == "ok")

        # ---------- Auth admin ----------
        print("\n[2] Auth admin")
        r = c.post("/auth/login", json={"usuario": "admin", "contrasena": "Admin123!"})
        check("POST /auth/login admin 200", r.status_code == 200, r.text)
        token_admin = r.json()["access_token"]
        H_ADMIN = {"Authorization": f"Bearer {token_admin}"}

        r = c.get("/auth/me", headers=H_ADMIN)
        check("GET /auth/me", r.status_code == 200 and r.json()["role"] == "admin")

        r = c.post("/auth/login", json={"usuario": "admin", "contrasena": "wrong"})
        check("POST /auth/login bad 401", r.status_code == 401)

        # ---------- Cliente nuevo ----------
        print("\n[3] Registro de cliente")
        r = c.post("/auth/register", json={
            "username": "cliente1", "email": "c1@x.com", "password": "Cliente123"
        })
        check("POST /auth/register 201", r.status_code == 201, r.text)

        r = c.post("/auth/login", json={"usuario": "cliente1", "contrasena": "Cliente123"})
        check("Login cliente OK", r.status_code == 200)
        token_cliente = r.json()["access_token"]
        H_CLIENTE = {"Authorization": f"Bearer {token_cliente}"}

        # ---------- Productos: lectura publica ----------
        print("\n[4] Productos")
        r = c.get("/products")
        check("GET /products publico", r.status_code == 200 and len(r.json()) >= 8)

        r = c.get("/products?category=res")
        check("Filtrar por category=res", r.status_code == 200 and all(p["category"] == "res" for p in r.json()))

        r = c.get("/products?q=lomo")
        check("Buscar q=lomo", r.status_code == 200 and any("Lomo" in p["name"] for p in r.json()))

        # ---------- Productos: admin escribe ----------
        new_p = {
            "slug": "test-corte", "name": "Test Corte", "description": "demo",
            "category": "res", "price": 10000.0, "stock": 5, "is_active": True
        }
        r = c.post("/products", json=new_p, headers=H_ADMIN)
        check("POST /products admin 201", r.status_code == 201, r.text)
        pid = r.json()["id"]

        r = c.patch(f"/products/{pid}", json={"price": 12000}, headers=H_ADMIN)
        check("PATCH /products admin", r.status_code == 200 and r.json()["price"] == 12000)

        r = c.post("/products", json=new_p, headers=H_CLIENTE)
        check("POST /products cliente 403", r.status_code == 403)

        r = c.delete(f"/products/{pid}", headers=H_ADMIN)
        check("DELETE /products admin 204", r.status_code == 204)

        # ---------- Pedidos ----------
        print("\n[5] Pedidos")
        order_payload = {
            "customer_name": "Juan Cliente",
            "customer_phone": "3000000000",
            "customer_email": "juan@x.com",
            "address": "Calle 1 #2-3",
            "items": [
                {"product_name": "Lomo Fino", "unit_price": 32000, "qty": 2},
                {"product_name": "Chorizos",  "unit_price": 15800, "qty": 1},
            ],
        }
        r = c.post("/orders", json=order_payload)
        check("POST /orders publico 201", r.status_code == 201, r.text)
        oid = r.json()["id"]
        check("Total calculado correcto", r.json()["total"] == 32000*2 + 15800)
        check("Estado inicial pendiente", r.json()["status"] == "pendiente")
        check("Items guardados", len(r.json()["items"]) == 2)

        r = c.get("/orders", headers=H_ADMIN)
        check("GET /orders admin", r.status_code == 200 and len(r.json()) >= 1)

        r = c.get("/orders", headers=H_CLIENTE)
        check("GET /orders cliente 403", r.status_code == 403)

        r = c.patch(f"/orders/{oid}/status", json={"status": "confirmado"}, headers=H_ADMIN)
        check("PATCH /orders/:id/status admin", r.status_code == 200 and r.json()["status"] == "confirmado")

        # ---------- Usuarios ----------
        print("\n[6] Usuarios")
        r = c.get("/users", headers=H_ADMIN)
        check("GET /users admin", r.status_code == 200 and len(r.json()) >= 2)
        cliente_id = next(u["id"] for u in r.json() if u["username"] == "cliente1")

        r = c.get("/users", headers=H_CLIENTE)
        check("GET /users cliente 403", r.status_code == 403)

        r = c.patch(f"/users/{cliente_id}", json={"role": "vendedor"}, headers=H_ADMIN)
        check("PATCH /users role -> vendedor", r.status_code == 200 and r.json()["role"] == "vendedor")

        r = c.patch(f"/users/{cliente_id}", json={"is_active": False}, headers=H_ADMIN)
        check("PATCH /users desactivar", r.status_code == 200 and r.json()["is_active"] is False)

        # admin no puede degradarse a si mismo
        admin_id = c.get("/auth/me", headers=H_ADMIN).json()["id"]
        r = c.patch(f"/users/{admin_id}", json={"role": "cliente"}, headers=H_ADMIN)
        check("Admin NO puede degradarse a si mismo", r.status_code == 400)

        # ---------- Dashboard ----------
        print("\n[7] Dashboard")
        r = c.get("/dashboard/stats", headers=H_ADMIN)
        check("GET /dashboard/stats admin", r.status_code == 200, r.text)
        s = r.json()
        check("products_count >= 8", s["products_count"] >= 8)
        check("orders_total >= 1",   s["orders_total"]   >= 1)
        check("sales_total > 0",     s["sales_total"]    > 0)
        check("users_count >= 2",    s["users_count"]    >= 2)

        # cliente1 ya quedo promovido a vendedor en la seccion [6]: para probar
        # el 403 de un rol "cliente" de verdad hace falta una cuenta nueva.
        c.post("/auth/register", json={"username": "cliente2", "email": "c2@x.com", "password": "Cliente123"})
        token_cliente2 = c.post("/auth/login", json={"usuario": "cliente2", "contrasena": "Cliente123"}).json()["access_token"]
        H_CLIENTE2 = {"Authorization": f"Bearer {token_cliente2}"}

        # ---------- Settings (banner + footer + whatsapp) ----------
        print("\n[8] Settings")
        r = c.get("/settings")
        check("GET /settings publico 200", r.status_code == 200, r.text)

        r = c.patch("/settings", json={"banner_title": "Titulo QA"}, headers=H_ADMIN)
        check("PATCH /settings admin", r.status_code == 200 and r.json()["banner_title"] == "Titulo QA")

        r = c.patch("/settings", json={"banner_title": "x"}, headers=H_CLIENTE2)
        check("PATCH /settings cliente 403", r.status_code == 403)

        # ---------- Promociones ----------
        print("\n[9] Promociones")
        r = c.post("/promotions", json={"name": "Promo QA", "price": "$1.000", "unit_price": 1000, "off": "TEST"}, headers=H_ADMIN)
        check("POST /promotions admin 201", r.status_code == 201, r.text)
        promo_id = r.json()["id"]

        r = c.get("/promotions")
        check("GET /promotions publico incluye la nueva", r.status_code == 200 and any(p["id"] == promo_id for p in r.json()))

        r = c.post("/promotions", json={"name": "x", "price": "$1", "off": "x"}, headers=H_CLIENTE2)
        check("POST /promotions cliente 403", r.status_code == 403)

        r = c.delete(f"/promotions/{promo_id}", headers=H_ADMIN)
        check("DELETE /promotions admin 204", r.status_code == 204)

        # ---------- Blog / recetas ----------
        print("\n[10] Blog")
        r = c.post("/blog-posts", json={"title": "Receta QA", "date": "1 enero", "excerpt": "x", "content": "<p>x</p>"}, headers=H_ADMIN)
        check("POST /blog-posts admin 201", r.status_code == 201, r.text)
        post_id = r.json()["id"]

        r = c.get("/blog-posts")
        check("GET /blog-posts publico incluye la nueva", r.status_code == 200 and any(p["id"] == post_id for p in r.json()))

        r = c.delete(f"/blog-posts/{post_id}", headers=H_ADMIN)
        check("DELETE /blog-posts admin 204", r.status_code == 204)

        # ---------- Categorias de catalogo ----------
        print("\n[11] Catalogo")
        r = c.post("/catalog-categories", json={"slug": "qa-test", "label": "QA Test"}, headers=H_ADMIN)
        check("POST /catalog-categories admin 201", r.status_code == 201, r.text)
        cat_id = r.json()["id"]

        r = c.post("/catalog-categories", json={"slug": "qa-test", "label": "Duplicado"}, headers=H_ADMIN)
        check("POST /catalog-categories slug duplicado 409", r.status_code == 409)

        r = c.delete(f"/catalog-categories/{cat_id}", headers=H_ADMIN)
        check("DELETE /catalog-categories admin 204", r.status_code == 204)

        # ---------- Cortes premium ----------
        print("\n[12] Cortes premium")
        r = c.post("/premium-sections", json={"title": "Seccion QA"}, headers=H_ADMIN)
        check("POST /premium-sections admin 201", r.status_code == 201, r.text)
        section_id = r.json()["id"]

        r = c.post("/premium-cuts", json={"section_id": section_id, "name": "Corte QA", "price": "$1.000/kg", "unit_price": 1000}, headers=H_ADMIN)
        check("POST /premium-cuts admin 201", r.status_code == 201, r.text)
        cut_id = r.json()["id"]

        r = c.get("/premium-cuts")
        check("GET /premium-cuts trae el corte con su section_id", r.status_code == 200 and any(x["id"] == cut_id and x["section_id"] == section_id for x in r.json()))

        # borrar la seccion no debe borrar el corte, solo desvincularlo
        r = c.delete(f"/premium-sections/{section_id}", headers=H_ADMIN)
        check("DELETE /premium-sections admin 204", r.status_code == 204)

        r = c.get("/premium-cuts")
        cut_after = next((x for x in r.json() if x["id"] == cut_id), None)
        check("El corte sobrevive sin seccion (section_id None)", cut_after is not None and cut_after["section_id"] is None)

        r = c.delete(f"/premium-cuts/{cut_id}", headers=H_ADMIN)
        check("DELETE /premium-cuts admin 204", r.status_code == 204)

    # Resumen
    total = len(results)
    passed = sum(1 for _, ok in results if ok)
    failed = total - passed
    print(f"\n=== Resumen: {passed}/{total} OK, {failed} fallos ===")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
