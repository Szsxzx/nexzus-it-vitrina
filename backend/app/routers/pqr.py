"""PQR: radicar y consultar (publico), listar y gestionar (admin/vendedor)."""
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.pqr import DIAS_HABILES_RESPUESTA, TZ_COLOMBIA, Pqr, sumar_dias_habiles
from app.models.user import UserRole
from app.schemas.pqr import (
    PqrAdminOut, PqrConsultaOut, PqrCreate, PqrEstado, PqrRadicadoOut, PqrTipo, PqrUpdate,
)


router = APIRouter(prefix="/pqr", tags=["pqr"])

STAFF = Depends(require_roles(UserRole.admin, UserRole.vendedor))


@router.post("", response_model=PqrRadicadoOut, status_code=status.HTTP_201_CREATED)
def radicar_pqr(payload: PqrCreate, db: Session = Depends(get_db)):
    ahora = datetime.now(timezone.utc)
    hoy_co = ahora.astimezone(TZ_COLOMBIA).date()

    pqr = Pqr(
        **payload.model_dump(),
        estado="radicado",
        fecha_radicacion=ahora,
        fecha_limite_respuesta=sumar_dias_habiles(hoy_co, DIAS_HABILES_RESPUESTA),
    )
    db.add(pqr)
    db.flush()  # asigna pqr.id
    pqr.radicado = f"PQR-{hoy_co.year}-{pqr.id:06d}"
    db.commit()
    db.refresh(pqr)
    return pqr


@router.get("/consulta", response_model=PqrConsultaOut)
def consultar_pqr(
    radicado: str = Query(min_length=5, max_length=30),
    documento: str = Query(min_length=3, max_length=30),
    db: Session = Depends(get_db),
):
    """Consulta publica: exige radicado + numero de documento. Si no coinciden,
    404 generico (no revela si el radicado existe)."""
    pqr = db.query(Pqr).filter(Pqr.radicado == radicado.strip().upper()).first()
    if not pqr or pqr.numero_documento.strip().upper() != documento.strip().upper():
        raise HTTPException(status_code=404, detail="No se encontró una PQR con esos datos")
    return pqr


@router.get("", response_model=List[PqrAdminOut], dependencies=[STAFF])
def listar_pqr(
    estado: Optional[PqrEstado] = None,
    tipo: Optional[PqrTipo] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Pqr)
    if estado:
        q = q.filter(Pqr.estado == estado)
    if tipo:
        q = q.filter(Pqr.tipo == tipo)
    return q.order_by(Pqr.fecha_radicacion.desc()).all()


@router.patch("/{pqr_id}", response_model=PqrAdminOut, dependencies=[STAFF])
def actualizar_pqr(pqr_id: int, payload: PqrUpdate, db: Session = Depends(get_db)):
    pqr = db.query(Pqr).filter(Pqr.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")

    if payload.respuesta is not None:
        pqr.respuesta = payload.respuesta.strip()
        pqr.fecha_respuesta = datetime.now(timezone.utc)
        # Responder deja la PQR en "respondido", salvo que se cierre en el mismo paso.
        pqr.estado = "cerrado" if payload.estado == "cerrado" else "respondido"
    elif payload.estado is not None:
        pqr.estado = payload.estado

    pqr.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(pqr)
    return pqr
