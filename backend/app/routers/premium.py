"""CRUD de secciones y cortes premium. Lectura publica, escritura admin/vendedor."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.content import PremiumSection, PremiumCut
from app.schemas.content import (
    PremiumSectionCreate, PremiumSectionUpdate, PremiumSectionOut,
    PremiumCutCreate, PremiumCutUpdate, PremiumCutOut,
)


router = APIRouter(tags=["premium"])


# ── Secciones ────────────────────────────────────────────────────────────

@router.get("/premium-sections", response_model=List[PremiumSectionOut])
def list_sections(db: Session = Depends(get_db)):
    return db.query(PremiumSection).order_by(PremiumSection.sort_order).all()


@router.post("/premium-sections", response_model=PremiumSectionOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def create_section(payload: PremiumSectionCreate, db: Session = Depends(get_db)):
    s = PremiumSection(**payload.model_dump())
    db.add(s); db.commit(); db.refresh(s)
    return s


@router.patch("/premium-sections/{section_id}", response_model=PremiumSectionOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_section(section_id: int, payload: PremiumSectionUpdate, db: Session = Depends(get_db)):
    s = db.query(PremiumSection).filter(PremiumSection.id == section_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Seccion no encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit(); db.refresh(s)
    return s


@router.delete("/premium-sections/{section_id}", status_code=204,
               dependencies=[Depends(require_roles(UserRole.admin))])
def delete_section(section_id: int, db: Session = Depends(get_db)):
    s = db.query(PremiumSection).filter(PremiumSection.id == section_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Seccion no encontrada")
    db.delete(s); db.commit()  # ON DELETE SET NULL deja sueltos los cortes de esta seccion


# ── Cortes ───────────────────────────────────────────────────────────────

@router.get("/premium-cuts", response_model=List[PremiumCutOut])
def list_cuts(db: Session = Depends(get_db)):
    return db.query(PremiumCut).order_by(PremiumCut.sort_order).all()


@router.post("/premium-cuts", response_model=PremiumCutOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def create_cut(payload: PremiumCutCreate, db: Session = Depends(get_db)):
    c = PremiumCut(**payload.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c


@router.patch("/premium-cuts/{cut_id}", response_model=PremiumCutOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_cut(cut_id: int, payload: PremiumCutUpdate, db: Session = Depends(get_db)):
    c = db.query(PremiumCut).filter(PremiumCut.id == cut_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Corte no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit(); db.refresh(c)
    return c


@router.delete("/premium-cuts/{cut_id}", status_code=204,
               dependencies=[Depends(require_roles(UserRole.admin))])
def delete_cut(cut_id: int, db: Session = Depends(get_db)):
    c = db.query(PremiumCut).filter(PremiumCut.id == cut_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Corte no encontrado")
    db.delete(c); db.commit()
