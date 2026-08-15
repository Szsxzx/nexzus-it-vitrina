"""CRUD de categorias del catalogo publico. Lectura publica, escritura admin/vendedor."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.content import CatalogCategory
from app.schemas.content import CatalogCategoryCreate, CatalogCategoryUpdate, CatalogCategoryOut


router = APIRouter(prefix="/catalog-categories", tags=["catalog"])


@router.get("", response_model=List[CatalogCategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(CatalogCategory).order_by(CatalogCategory.sort_order).all()


@router.post("", response_model=CatalogCategoryOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def create_category(payload: CatalogCategoryCreate, db: Session = Depends(get_db)):
    if db.query(CatalogCategory).filter(CatalogCategory.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Ya existe una categoria con ese slug")
    c = CatalogCategory(**payload.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c


@router.patch("/{category_id}", response_model=CatalogCategoryOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_category(category_id: int, payload: CatalogCategoryUpdate, db: Session = Depends(get_db)):
    c = db.query(CatalogCategory).filter(CatalogCategory.id == category_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit(); db.refresh(c)
    return c


@router.delete("/{category_id}", status_code=204,
               dependencies=[Depends(require_roles(UserRole.admin))])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    c = db.query(CatalogCategory).filter(CatalogCategory.id == category_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    db.delete(c); db.commit()
