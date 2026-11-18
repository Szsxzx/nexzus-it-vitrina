"""Schemas del checkout con Wompi."""
from typing import List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field

PaymentStatus = Literal["pendiente", "aprobado", "rechazado", "anulado", "error"]


class CheckoutItem(BaseModel):
    product_id: Optional[int] = Field(default=None, ge=1)
    name: str = Field(min_length=1, max_length=150)
    qty: int = Field(ge=1, le=99)
    # Se ignora si viene product_id (manda el precio de la BD).
    unit_price: float = Field(default=0, ge=0)


class CheckoutIn(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    customer_email: EmailStr
    customer_phone: str = Field(min_length=7, max_length=50)
    customer_document: Optional[str] = Field(default=None, max_length=30)
    address: Optional[str] = Field(default=None, max_length=300)
    notes: Optional[str] = Field(default=None, max_length=1000)
    items: List[CheckoutItem] = Field(min_length=1, max_length=50)


class CheckoutOut(BaseModel):
    order_id: int
    reference: str
    amount_in_cents: int
    currency: Literal["COP"] = "COP"
    public_key: str
    signature_integrity: str
    redirect_url: str
    checkout_url: str


class PaymentStatusOut(BaseModel):
    reference: str
    order_id: int
    status: PaymentStatus
    amount_in_cents: int
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    customer_name: str
