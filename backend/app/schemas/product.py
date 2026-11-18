"""Schemas Pydantic para productos y pedidos."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.product import DEFAULT_CATEGORY, OrderStatus


# ---------- Product ----------
class ProductBase(BaseModel):
    slug: str = Field(min_length=2, max_length=100)
    name: str = Field(min_length=2, max_length=150)
    description: str = ""
    category: str = Field(default=DEFAULT_CATEGORY, min_length=1, max_length=50)
    price: float = Field(ge=0)
    old_price: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    rating: float = Field(default=4.5, ge=0, le=5)
    review_count: int = Field(default=0, ge=0)
    discount: Optional[str] = None
    tags: Optional[str] = None
    stock: int = 0
    is_active: bool = True


class ProductCreate(ProductBase): ...
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=50)
    price: Optional[float] = Field(default=None, ge=0)
    old_price: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    review_count: Optional[int] = Field(default=None, ge=0)
    discount: Optional[str] = None
    tags: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- Order ----------
class OrderItemIn(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    unit_price: float = Field(ge=0)
    qty: int = Field(ge=1)


class OrderItemOut(OrderItemIn):
    id: int
    subtotal: float
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2)
    customer_phone: str = Field(min_length=5)
    customer_email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    channel: str = "web"
    items: List[OrderItemIn] = Field(min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    customer_email: Optional[str]
    address: Optional[str]
    notes: Optional[str]
    status: OrderStatus
    total: float
    channel: str
    customer_document: Optional[str] = None
    reference: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut]
    model_config = ConfigDict(from_attributes=True)


# ---------- Dashboard ----------
class DashboardStats(BaseModel):
    products_count: int
    products_active: int
    orders_total: int
    orders_pending: int
    orders_today: int
    sales_total: float
    sales_today: float
    users_count: int
