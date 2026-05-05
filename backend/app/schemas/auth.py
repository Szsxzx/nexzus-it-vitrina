"""Schemas de autenticación."""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserOut


class LoginRequest(BaseModel):
    usuario: str = Field(min_length=3, description="Usuario o correo")
    contrasena: str = Field(min_length=1)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ResetRequest(BaseModel):
    correo: EmailStr


class ResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class GenericResponse(BaseModel):
    success: bool
    message: Optional[str] = None
