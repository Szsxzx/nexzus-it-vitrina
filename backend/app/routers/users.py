"""Gestion de usuarios desde el panel — solo admin."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles, get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserOut
from app.schemas.admin import UserAdminUpdate


router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserOut],
            dependencies=[Depends(require_roles(UserRole.admin))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/{user_id}", response_model=UserOut,
              dependencies=[Depends(require_roles(UserRole.admin))])
def update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if u.id == me.id and payload.role and payload.role != UserRole.admin:
        raise HTTPException(status_code=400, detail="No puedes degradarte a ti mismo")
    if u.id == me.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="No puedes desactivarte a ti mismo")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(u, k, v)
    db.commit(); db.refresh(u)
    return u


@router.delete("/{user_id}", status_code=204,
               dependencies=[Depends(require_roles(UserRole.admin))])
def delete_user(user_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    if user_id == me.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(u); db.commit()
