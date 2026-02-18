"""add cabinet table and shelf.cabinet_id

Revision ID: c6d8e9f0a1b2
Revises: b5e7f8a9c0d1
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c6d8e9f0a1b2"
down_revision: Union[str, Sequence[str], None] = "b5e7f8a9c0d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cabinet",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_cabinet_id"), "cabinet", ["id"], unique=False)
    op.create_index(op.f("ix_cabinet_name"), "cabinet", ["name"], unique=False)

    op.add_column("shelf", sa.Column("cabinet_id", sa.Uuid(), nullable=True))
    op.create_foreign_key("fk_shelf_cabinet_id", "shelf", "cabinet", ["cabinet_id"], ["id"])
    op.create_index(op.f("ix_shelf_cabinet_id"), "shelf", ["cabinet_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_shelf_cabinet_id"), table_name="shelf")
    op.drop_constraint("fk_shelf_cabinet_id", "shelf", type_="foreignkey")
    op.drop_column("shelf", "cabinet_id")

    op.drop_index(op.f("ix_cabinet_name"), table_name="cabinet")
    op.drop_index(op.f("ix_cabinet_id"), table_name="cabinet")
    op.drop_table("cabinet")
