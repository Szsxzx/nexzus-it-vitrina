"""Modelos de catálogo y pedidos."""
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Enum, Float, Text, ForeignKey
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(str, enum.Enum):
    res       = "res"
    cerdo     = "cerdo"
    pollo     = "pollo"
    embutidos = "embutidos"
    pescado   = "pescado"


class Product(Base):
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    slug        = Column(String(100), unique=True, nullable=False, index=True)
    name        = Column(String(150), nullable=False)
    description = Column(Text, nullable=False, default="")
    category    = Column(Enum(Category), nullable=False, default=Category.res)

    price       = Column(Float, nullable=False, default=0.0)
    old_price   = Column(Float, nullable=True)

    image_url   = Column(String(500), nullable=True)
    rating      = Column(Float, default=4.5)
    review_count= Column(Integer, default=0)

    discount    = Column(String(20), nullable=True)
    tags        = Column(String(300), nullable=True)  # CSV simple
    stock       = Column(Integer, default=0)
    is_active   = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class OrderStatus(str, enum.Enum):
    pendiente   = "pendiente"
    confirmado  = "confirmado"
    en_camino   = "en_camino"
    entregado   = "entregado"
    cancelado   = "cancelado"


class Order(Base):
    __tablename__ = "orders"

    id            = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)
    customer_phone= Column(String(50), nullable=False)
    customer_email= Column(String(255), nullable=True)
    address       = Column(String(300), nullable=True)
    notes         = Column(Text, nullable=True)

    status        = Column(Enum(OrderStatus), default=OrderStatus.pendiente, nullable=False)
    total         = Column(Float, default=0.0, nullable=False)
    channel       = Column(String(30), default="web", nullable=False)  # web/whatsapp/local

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id           = Column(Integer, primary_key=True, index=True)
    order_id     = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id   = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(150), nullable=False)  # snapshot del nombre al pedir
    unit_price   = Column(Float, nullable=False)
    qty          = Column(Integer, nullable=False, default=1)
    subtotal     = Column(Float, nullable=False, default=0.0)

    order   = relationship("Order", back_populates="items")
    product = relationship("Product")
