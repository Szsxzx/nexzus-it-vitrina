"""CRUD de promociones. Lectura publica, escritura admin/vendedor."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.content import Promotion
from app.schemas.content import PromotionCreate, PromotionUpdate, PromotionOut


router = APIRouter(prefix="/promotions", tags=["promotions"])


@router.get("", response_model=List[PromotionOut])
def list_promotions(db: Session = Depends(get_db)):
    return db.query(Promotion).order_by(Promotion.sort_order).all()


@router.post("", response_model=PromotionOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def create_promotion(payload: PromotionCreate, db: Session = Depends(get_db)):
    p = Promotion(**payload.model_dump())
    db.add(p); db.commit(); db.refresh(p)
    return p


@router.patch("/{promo_id}", response_model=PromotionOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_promotion(promo_id: int, payload: PromotionUpdate, db: Session = Depends(get_db)):
    p = db.query(Promotion).filter(Promotion.id == promo_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Promocion no encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p


@router.delete("/{promo_id}", status_code=204,
               dependencies=[Depends(require_roles(UserRole.admin))])
def delete_promotion(promo_id: int, db: Session = Depends(get_db)):
    p = db.query(Promotion).filter(Promotion.id == promo_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Promocion no encontrada")
    db.delete(p); db.commit()
