"""CRUD de productos. Lectura publica, escritura solo admin/vendedor."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.product import Product, Category
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut


router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[Category] = None,
    q: Optional[str] = Query(default=None, description="Busqueda por nombre/desc"),
    only_active: bool = True,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if only_active:
        query = query.filter(Product.is_active == True)  # noqa: E712
    if category:
        query = query.filter(Product.category == category)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            (Product.name.ilike(like)) | (Product.description.ilike(like))
        )
    return query.order_by(Product.created_at.desc()).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Ya existe un producto con ese slug")
    p = Product(**payload.model_dump())
    db.add(p); db.commit(); db.refresh(p)
    return p


@router.patch("/{product_id}", response_model=ProductOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p


@router.delete("/{product_id}", status_code=204,
               dependencies=[Depends(require_roles(UserRole.admin))])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(p); db.commit()
