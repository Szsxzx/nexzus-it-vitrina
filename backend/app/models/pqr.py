"""PQR: peticiones, quejas, reclamos, sugerencias y felicitaciones.

Ley 1755 de 2015: la respuesta debe darse en maximo 15 dias habiles. Tipo, estado y
tipo de documento se guardan como texto (validados en los schemas) para que la
migracion sea igual en SQLite y PostgreSQL, sin tipos ENUM nativos.
"""
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text

from app.core.database import Base


PQR_TIPOS = ("peticion", "queja", "reclamo", "sugerencia", "felicitacion")
PQR_ESTADOS = ("radicado", "en_tramite", "respondido", "cerrado")
TIPOS_DOCUMENTO = ("CC", "CE", "NIT", "PAS")

DIAS_HABILES_RESPUESTA = 15
# Colombia no tiene horario de verano: UTC-5 fijo.
TZ_COLOMBIA = timezone(timedelta(hours=-5))


def sumar_dias_habiles(inicio: date, dias: int) -> date:
    """Suma `dias` habiles (lunes a viernes) a partir del dia siguiente a `inicio`.

    No descuenta festivos colombianos: el plazo real puede ser uno o dos dias mayor.
    """
    actual = inicio
    restantes = dias
    while restantes > 0:
        actual += timedelta(days=1)
        if actual.weekday() < 5:
            restantes -= 1
    return actual


class Pqr(Base):
    __tablename__ = "pqrs"

    id        = Column(Integer, primary_key=True, index=True)
    # Se asigna justo despues del INSERT (necesita el id): PQR-<año>-<id 6 digitos>
    radicado  = Column(String(30), unique=True, nullable=True, index=True)

    tipo             = Column(String(20), nullable=False)
    nombre           = Column(String(150), nullable=False)
    tipo_documento   = Column(String(5), nullable=False)
    numero_documento = Column(String(30), nullable=False)
    email            = Column(String(255), nullable=False)
    telefono         = Column(String(50), nullable=True)
    asunto           = Column(String(200), nullable=False)
    descripcion      = Column(Text, nullable=False)
    referencia_pedido = Column(String(60), nullable=True)
    acepta_tratamiento_datos = Column(Boolean, nullable=False, default=False)

    estado    = Column(String(20), nullable=False, default="radicado", index=True)
    respuesta = Column(Text, nullable=True)

    fecha_radicacion       = Column(DateTime(timezone=True), nullable=False,
                                    default=lambda: datetime.now(timezone.utc))
    fecha_limite_respuesta = Column(Date, nullable=False)
    fecha_respuesta        = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
