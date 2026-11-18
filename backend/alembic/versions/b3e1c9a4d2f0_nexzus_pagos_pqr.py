"""NEXZUS: categoria de producto como texto, pagos Wompi en orders y tabla pqrs

Revision ID: b3e1c9a4d2f0
Revises: 97cf6f6722bd
Create Date: 2026-11-17 10:00:00

- products.category: ENUM('res', ...) -> VARCHAR(50). En PostgreSQL se elimina el tipo
  enum `category` despues de convertir.
- orders: customer_document, reference (unico), payment_status, payment_method,
  transaction_id.
- pqrs: tabla nueva.

Usa batch_alter_table para que funcione igual en SQLite (recrea la tabla) y en
PostgreSQL (ALTER TABLE directo).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b3e1c9a4d2f0"
down_revision: Union[str, Sequence[str], None] = "97cf6f6722bd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD_CATEGORIES = ("res", "cerdo", "pollo", "embutidos", "pescado")


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    # --- products.category: enum -> texto ---
    with op.batch_alter_table("products") as batch_op:
        batch_op.alter_column(
            "category",
            existing_type=sa.Enum(*OLD_CATEGORIES, name="category"),
            type_=sa.String(length=50),
            existing_nullable=False,
            postgresql_using="category::text",
        )
    if _is_postgres():
        op.execute("DROP TYPE IF EXISTS category")

    # --- orders: datos de pago ---
    with op.batch_alter_table("orders") as batch_op:
        batch_op.add_column(sa.Column("customer_document", sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column("reference", sa.String(length=40), nullable=True))
        batch_op.add_column(sa.Column("payment_status", sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column("payment_method", sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column("transaction_id", sa.String(length=80), nullable=True))
        batch_op.create_index("ix_orders_reference", ["reference"], unique=True)

    # --- pqrs ---
    op.create_table(
        "pqrs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("radicado", sa.String(length=30), nullable=True),
        sa.Column("tipo", sa.String(length=20), nullable=False),
        sa.Column("nombre", sa.String(length=150), nullable=False),
        sa.Column("tipo_documento", sa.String(length=5), nullable=False),
        sa.Column("numero_documento", sa.String(length=30), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("telefono", sa.String(length=50), nullable=True),
        sa.Column("asunto", sa.String(length=200), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("referencia_pedido", sa.String(length=60), nullable=True),
        sa.Column("acepta_tratamiento_datos", sa.Boolean(), nullable=False),
        sa.Column("estado", sa.String(length=20), nullable=False),
        sa.Column("respuesta", sa.Text(), nullable=True),
        sa.Column("fecha_radicacion", sa.DateTime(timezone=True), nullable=False),
        sa.Column("fecha_limite_respuesta", sa.Date(), nullable=False),
        sa.Column("fecha_respuesta", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_pqrs_id", "pqrs", ["id"], unique=False)
    op.create_index("ix_pqrs_radicado", "pqrs", ["radicado"], unique=True)
    op.create_index("ix_pqrs_estado", "pqrs", ["estado"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_pqrs_estado", table_name="pqrs")
    op.drop_index("ix_pqrs_radicado", table_name="pqrs")
    op.drop_index("ix_pqrs_id", table_name="pqrs")
    op.drop_table("pqrs")

    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_index("ix_orders_reference")
        batch_op.drop_column("transaction_id")
        batch_op.drop_column("payment_method")
        batch_op.drop_column("payment_status")
        batch_op.drop_column("reference")
        batch_op.drop_column("customer_document")

    # Las categorias nuevas (software, hardware, ...) no existen en el enum viejo:
    # se reasignan a 'res' para que la conversion no falle.
    allowed = ", ".join(f"'{c}'" for c in OLD_CATEGORIES)
    op.execute(f"UPDATE products SET category = 'res' WHERE category NOT IN ({allowed})")

    old_enum = sa.Enum(*OLD_CATEGORIES, name="category")
    if _is_postgres():
        old_enum.create(op.get_bind(), checkfirst=True)
    with op.batch_alter_table("products") as batch_op:
        batch_op.alter_column(
            "category",
            existing_type=sa.String(length=50),
            type_=old_enum,
            existing_nullable=False,
            postgresql_using="category::category",
        )
