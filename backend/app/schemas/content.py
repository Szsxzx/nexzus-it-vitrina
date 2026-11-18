"""Schemas Pydantic para el contenido editable del sitio."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------- Site settings (banner + footer + whatsapp) ----------
class SiteSettingsOut(BaseModel):
    banner_subtitle: str
    banner_title: str
    banner_highlight: str
    banner_cta_text: str
    banner_cta_href: str
    footer_address: str
    footer_phone: str
    footer_email: str
    footer_whatsapp_number: str
    footer_schedule_week: str
    footer_schedule_sunday: str
    footer_copyright: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SiteSettingsUpdate(BaseModel):
    banner_subtitle: Optional[str] = None
    banner_title: Optional[str] = None
    banner_highlight: Optional[str] = None
    banner_cta_text: Optional[str] = None
    banner_cta_href: Optional[str] = None
    footer_address: Optional[str] = None
    footer_phone: Optional[str] = None
    footer_email: Optional[str] = None
    footer_whatsapp_number: Optional[str] = None
    footer_schedule_week: Optional[str] = None
    footer_schedule_sunday: Optional[str] = None
    footer_copyright: Optional[str] = None


# ---------- Promotion ----------
class PromotionBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    price: str = Field(min_length=1, max_length=30)
    old_price: Optional[str] = None
    unit_price: float = Field(default=0.0, ge=0)
    off: str = ""
    color: str = "bg-primary"
    img: Optional[str] = None
    sort_order: int = 0


class PromotionCreate(PromotionBase): ...


class PromotionUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[str] = None
    old_price: Optional[str] = None
    unit_price: Optional[float] = Field(default=None, ge=0)
    off: Optional[str] = None
    color: Optional[str] = None
    img: Optional[str] = None
    sort_order: Optional[int] = None


class PromotionOut(PromotionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- BlogPost ----------
class BlogPostBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    date: str = Field(min_length=1, max_length=50)
    image: Optional[str] = None
    excerpt: str = ""
    content: str = ""
    sort_order: int = 0


class BlogPostCreate(BlogPostBase): ...


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    image: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    sort_order: Optional[int] = None


class BlogPostOut(BlogPostBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- CatalogCategory ----------
class CatalogCategoryBase(BaseModel):
    slug: str = Field(min_length=1, max_length=50)
    label: str = Field(min_length=1, max_length=100)
    css_class: str = "from-primary to-secondary"
    image: Optional[str] = None
    sort_order: int = 0


class CatalogCategoryCreate(CatalogCategoryBase): ...


class CatalogCategoryUpdate(BaseModel):
    slug: Optional[str] = None
    label: Optional[str] = None
    css_class: Optional[str] = None
    image: Optional[str] = None
    sort_order: Optional[int] = None


class CatalogCategoryOut(CatalogCategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- PremiumSection ----------
class PremiumSectionBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    icon: str = "fa-laptop-code"
    color: str = "bg-primary"
    sort_order: int = 0


class PremiumSectionCreate(PremiumSectionBase): ...


class PremiumSectionUpdate(BaseModel):
    title: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = None


class PremiumSectionOut(PremiumSectionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- PremiumCut ----------
class PremiumCutBase(BaseModel):
    section_id: Optional[int] = None
    name: str = Field(min_length=1, max_length=150)
    price: str = Field(min_length=1, max_length=30)
    unit_price: float = Field(default=0.0, ge=0)
    origin: Optional[str] = None
    img: Optional[str] = None
    badge: Optional[str] = None
    badge_color: str = "bg-primary"
    text: Optional[str] = None
    sort_order: int = 0


class PremiumCutCreate(PremiumCutBase): ...


class PremiumCutUpdate(BaseModel):
    section_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[str] = None
    unit_price: Optional[float] = Field(default=None, ge=0)
    origin: Optional[str] = None
    img: Optional[str] = None
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    text: Optional[str] = None
    sort_order: Optional[int] = None


class PremiumCutOut(PremiumCutBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
