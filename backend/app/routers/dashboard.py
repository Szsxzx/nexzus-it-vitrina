"""Metricas para el dashboard del admin."""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User, UserRole
from app.models.product import Product, Order, OrderStatus
from app.schemas.product import DashboardStats


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats,
            dependencies=[Depends(require_roles(UserRole.admin, UserRole.vendedor))])
def get_stats(db: Session = Depends(get_db)):
    # Hoy = 00:00 a 23:59 UTC (suficiente para el MVP)
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    products_count  = db.query(func.count(Product.id)).scalar() or 0
    products_active = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0  # noqa: E712

    orders_total   = db.query(func.count(Order.id)).scalar() or 0
    orders_pending = db.query(func.count(Order.id)).filter(Order.status == OrderStatus.pendiente).scalar() or 0
    orders_today   = db.query(func.count(Order.id)).filter(Order.created_at >= today_start).scalar() or 0

    sales_total = db.query(func.coalesce(func.sum(Order.total), 0.0)).filter(
        Order.status != OrderStatus.cancelado
    ).scalar() or 0.0
    sales_today = db.query(func.coalesce(func.sum(Order.total), 0.0)).filter(
        Order.status != OrderStatus.cancelado,
        Order.created_at >= today_start,
    ).scalar() or 0.0

    users_count = db.query(func.count(User.id)).scalar() or 0

    return DashboardStats(
        products_count=products_count,
        products_active=products_active,
        orders_total=orders_total,
        orders_pending=orders_pending,
        orders_today=orders_today,
        sales_total=float(sales_total),
        sales_today=float(sales_today),
        users_count=users_count,
    )
