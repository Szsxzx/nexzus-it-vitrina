"""Configuracion del sitio: banner + footer + whatsapp. Fila unica (id=1)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.content import SiteSettings
from app.schemas.content import SiteSettingsOut, SiteSettingsUpdate


router = APIRouter(prefix="/settings", tags=["settings"])


def _get_or_create(db: Session) -> SiteSettings:
    s = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if not s:
        s = SiteSettings(id=1)
        db.add(s); db.commit(); db.refresh(s)
    return s


@router.get("", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create(db)


@router.patch("", response_model=SiteSettingsOut,
              dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def update_settings(payload: SiteSettingsUpdate, db: Session = Depends(get_db)):
    s = _get_or_create(db)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit(); db.refresh(s)
    return s
