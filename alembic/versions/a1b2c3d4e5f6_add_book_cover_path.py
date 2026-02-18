"""add book cover_path

Revision ID: a1b2c3d4e5f6
Revises: 2429ad793452
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "2429ad793452"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("book", sa.Column("cover_path", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("book", "cover_path")
