"""Endpoints de autenticación: register, login, me, reset-password."""
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.schemas.auth import GenericResponse, LoginRequest, ResetConfirm, ResetRequest, Token
from app.schemas.user import UserCreate, UserOut


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Registro público — crea siempre con rol `cliente`. Para crear admin/vendedor usa el panel."""
    exists = db.query(User).filter(
        or_(User.email == payload.email, User.username == payload.username)
    ).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario o email ya registrados")

    user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=UserRole.cliente,  # forzado, ignoramos lo que mande el cliente
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login con usuario o email + contraseña. Devuelve JWT + datos del usuario."""
    if not payload.usuario or not payload.contrasena:
        raise HTTPException(status_code=400, detail="Debes completar usuario y contraseña")

    user = db.query(User).filter(
        or_(User.username == payload.usuario, User.email == payload.usuario)
    ).first()

    if not user or not verify_password(payload.contrasena, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tu cuenta está inactiva. Contacta al administrador")

    token = create_access_token(subject=user.id, extra={"role": user.role.value})
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current


@router.post("/reset-password/request", response_model=GenericResponse)
def reset_request(payload: ResetRequest, db: Session = Depends(get_db)):
    """Genera un token de recuperación. (Por seguridad responde siempre éxito.)"""
    user = db.query(User).filter(User.email == payload.correo).first()
    if user:
        user.reset_token = secrets.token_urlsafe(48)
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()
        # TODO: enviar email con el link real (SMTP/Sendgrid). Por ahora se imprime.
        print(f"[RESET] {user.email} → token={user.reset_token}")
    return GenericResponse(success=True, message="Si el correo existe, recibirás instrucciones")


@router.post("/reset-password/confirm", response_model=GenericResponse)
def reset_confirm(payload: ResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return GenericResponse(success=True, message="Contraseña actualizada")
