"""Modelos del contenido editable del sitio: banner, footer, promociones,
recetas, categorias del catalogo y cortes premium.

Antes vivian solo en localStorage del navegador (frontend/src/lib/siteData.ts),
asi que ningun cambio del panel llegaba a un cliente real. Aqui pasan a ser
tablas reales, mismo criterio de agrupacion tematica que product.py (que junta
Product+Order+OrderItem en un modulo).
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class SiteSettings(Base):
    """Fila unica (id=1): banner + footer + whatsapp.

    Se fusionan porque ya comparten dueno en el frontend — la pagina de
    WhatsApp edita hoy un campo dentro de FooterData — y asi el patron
    "tabla de una sola fila" solo se repite una vez, no dos.
    """
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True)

    banner_subtitle  = Column(String(200), nullable=False, default="")
    banner_title     = Column(String(200), nullable=False, default="")
    banner_highlight = Column(String(200), nullable=False, default="")
    banner_cta_text  = Column(String(100), nullable=False, default="")
    banner_cta_href  = Column(String(200), nullable=False, default="")

    footer_address         = Column(String(300), nullable=False, default="")
    footer_phone            = Column(String(50), nullable=False, default="")
    footer_email             = Column(String(255), nullable=False, default="")
    footer_whatsapp_number  = Column(String(30), nullable=False, default="")
    footer_schedule_week     = Column(String(200), nullable=False, default="")
    footer_schedule_sunday  = Column(String(200), nullable=False, default="")
    footer_copyright         = Column(String(300), nullable=False, default="")

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Promotion(Base):
    __tablename__ = "promotions"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(150), nullable=False)
    price      = Column(String(30), nullable=False)
    old_price  = Column(String(30), nullable=True)
    unit_price = Column(Float, nullable=False, default=0.0)
    off        = Column(String(30), nullable=False, default="")
    color      = Column(String(30), nullable=False, default="bg-primary")
    img        = Column(String(500), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id      = Column(Integer, primary_key=True, index=True)
    title   = Column(String(200), nullable=False)
    date    = Column(String(50), nullable=False)  # texto libre, ej. "15 Enero 2023"
    image   = Column(String(500), nullable=True)
    excerpt = Column(String(400), nullable=False, default="")
    content = Column(Text, nullable=False, default="")  # HTML
    sort_order = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class CatalogCategory(Base):
    __tablename__ = "catalog_categories"

    id         = Column(Integer, primary_key=True, index=True)
    slug       = Column(String(50), unique=True, nullable=False, index=True)
    label      = Column(String(100), nullable=False)
    css_class  = Column(String(100), nullable=False, default="from-primary to-secondary")
    image      = Column(String(500), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class PremiumSection(Base):
    __tablename__ = "premium_sections"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(100), nullable=False)
    icon       = Column(String(50), nullable=False, default="fa-laptop-code")
    color      = Column(String(30), nullable=False, default="bg-primary")
    sort_order = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    cuts = relationship("PremiumCut", back_populates="section")


class PremiumCut(Base):
    __tablename__ = "premium_cuts"

    id          = Column(Integer, primary_key=True, index=True)
    section_id  = Column(Integer, ForeignKey("premium_sections.id", ondelete="SET NULL"), nullable=True, index=True)
    name        = Column(String(150), nullable=False)
    price       = Column(String(30), nullable=False)
    unit_price  = Column(Float, nullable=False, default=0.0)
    origin      = Column(String(150), nullable=True)
    img         = Column(String(500), nullable=True)
    badge       = Column(String(50), nullable=True)
    badge_color = Column(String(30), nullable=False, default="bg-primary")
    text        = Column(String(400), nullable=True)
    sort_order  = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    section = relationship("PremiumSection", back_populates="cuts")
