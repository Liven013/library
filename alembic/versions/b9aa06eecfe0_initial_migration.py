"""Initial migration

Revision ID: b9aa06eecfe0
Revises: 
Create Date: 2026-01-03 00:54:37.500775

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9aa06eecfe0'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "author",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_author_id"), "author", ["id"], unique=False)

    op.create_table(
        "book",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("author_id", sa.Uuid(), nullable=True),
        sa.Column("publishing_year", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["author_id"], ["author.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_book_author_id"), "book", ["author_id"], unique=False)
    op.create_index(op.f("ix_book_id"), "book", ["id"], unique=False)
    op.create_index(op.f("ix_book_title"), "book", ["title"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_book_title"), table_name="book")
    op.drop_index(op.f("ix_book_id"), table_name="book")
    op.drop_index(op.f("ix_book_author_id"), table_name="book")
    op.drop_table("book")
    op.drop_index(op.f("ix_author_id"), table_name="author")
    op.drop_table("author")
