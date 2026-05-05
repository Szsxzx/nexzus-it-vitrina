"""Schemas para gestion de usuarios desde el panel."""
from typing import Optional
from pydantic import BaseModel
from app.models.user import UserRole


class UserAdminUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    full_name: Optional[str] = None
