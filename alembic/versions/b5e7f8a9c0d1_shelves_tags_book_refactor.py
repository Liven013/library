"""shelves, tags, book_tag, book refactor (short/full description, shelf_id, drop publishing_year)

Revision ID: b5e7f8a9c0d1
Revises: a1b2c3d4e5f6
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b5e7f8a9c0d1"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shelf",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_shelf_id"), "shelf", ["id"], unique=False)
    op.create_index(op.f("ix_shelf_name"), "shelf", ["name"], unique=False)

    op.create_table(
        "tag",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tag_id"), "tag", ["id"], unique=False)
    op.create_index(op.f("ix_tag_name"), "tag", ["name"], unique=True)

    op.add_column("book", sa.Column("short_description", sa.String(), nullable=True))
    op.add_column("book", sa.Column("full_description", sa.Text(), nullable=True))
    op.add_column("book", sa.Column("shelf_id", sa.Uuid(), nullable=True))

    op.execute("UPDATE book SET full_description = description WHERE description IS NOT NULL")
    op.drop_column("book", "description")
    op.drop_column("book", "publishing_year")

    op.create_foreign_key("fk_book_shelf_id", "book", "shelf", ["shelf_id"], ["id"])
    op.create_index(op.f("ix_book_shelf_id"), "book", ["shelf_id"], unique=False)

    op.create_table(
        "book_tag",
        sa.Column("book_id", sa.Uuid(), nullable=False),
        sa.Column("tag_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["book_id"], ["book.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tag.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("book_id", "tag_id"),
    )


def downgrade() -> None:
    op.drop_table("book_tag")
    op.drop_index(op.f("ix_book_shelf_id"), table_name="book")
    op.drop_constraint("fk_book_shelf_id", "book", type_="foreignkey")
    op.drop_column("book", "shelf_id")
    op.drop_column("book", "full_description")
    op.drop_column("book", "short_description")
    op.add_column("book", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("book", sa.Column("publishing_year", sa.Integer(), nullable=True))

    op.drop_index(op.f("ix_tag_name"), table_name="tag")
    op.drop_index(op.f("ix_tag_id"), table_name="tag")
    op.drop_table("tag")
    op.drop_index(op.f("ix_shelf_name"), table_name="shelf")
    op.drop_index(op.f("ix_shelf_id"), table_name="shelf")
    op.drop_table("shelf")
