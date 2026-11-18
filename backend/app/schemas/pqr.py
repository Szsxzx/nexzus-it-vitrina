"""Schemas de PQR."""
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

PqrTipo = Literal["peticion", "queja", "reclamo", "sugerencia", "felicitacion"]
PqrEstado = Literal["radicado", "en_tramite", "respondido", "cerrado"]
TipoDocumento = Literal["CC", "CE", "NIT", "PAS"]


class PqrCreate(BaseModel):
    tipo: PqrTipo
    nombre: str = Field(min_length=3, max_length=150)
    tipo_documento: TipoDocumento
    numero_documento: str = Field(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9.\-]+$")
    email: EmailStr
    telefono: Optional[str] = Field(default=None, max_length=50)
    asunto: str = Field(min_length=5, max_length=200)
    descripcion: str = Field(min_length=10, max_length=5000)
    referencia_pedido: Optional[str] = Field(default=None, max_length=60)
    acepta_tratamiento_datos: bool

    @field_validator("nombre", "numero_documento", "asunto", "descripcion", mode="before")
    @classmethod
    def _strip(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("telefono", "referencia_pedido", mode="before")
    @classmethod
    def _strip_opcional(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v

    @field_validator("acepta_tratamiento_datos")
    @classmethod
    def _debe_aceptar(cls, v: bool) -> bool:
        if v is not True:
            raise ValueError("Debe aceptar la política de tratamiento de datos personales")
        return v


class PqrRadicadoOut(BaseModel):
    radicado: str
    fecha_radicacion: datetime
    fecha_limite_respuesta: date
    estado: PqrEstado
    model_config = ConfigDict(from_attributes=True)


class PqrConsultaOut(BaseModel):
    radicado: str
    tipo: PqrTipo
    asunto: str
    descripcion: str
    estado: PqrEstado
    fecha_radicacion: datetime
    fecha_limite_respuesta: date
    respuesta: Optional[str] = None
    fecha_respuesta: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class PqrAdminOut(PqrConsultaOut):
    id: int
    nombre: str
    tipo_documento: TipoDocumento
    numero_documento: str
    email: str
    telefono: Optional[str] = None
    referencia_pedido: Optional[str] = None
    acepta_tratamiento_datos: bool
    created_at: datetime
    updated_at: datetime


class PqrUpdate(BaseModel):
    estado: Optional[PqrEstado] = None
    respuesta: Optional[str] = Field(default=None, min_length=1, max_length=5000)
