from uuid import uuid4, UUID

from sqlmodel import Field, SQLModel, Text

from src.models.base import Pagination


class BookTagLink(SQLModel, table=True):
    __tablename__ = "book_tag"
    book_id: UUID = Field(foreign_key="book.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tag.id", primary_key=True)


class Book(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    title: str = Field(index=True)
    cover_path: str | None = Field(default=None)
    short_description: str | None = Field(default=None)
    full_description: str | None = Field(sa_type=Text, default=None)
    author_id: UUID | None = Field(default=None, foreign_key="author.id")
    shelf_id: UUID | None = Field(default=None, foreign_key="shelf.id")

    model_config = {"from_attributes": True}


class BookCreate(SQLModel):
    title: str
    cover_path: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    author_id: UUID | None = None
    shelf_id: UUID | None = None
    tag_ids: list[UUID] = []


class BookUpdate(SQLModel):
    title: str | None = None
    cover_path: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    author_id: UUID | None = None
    shelf_id: UUID | None = None
    tag_ids: list[UUID] | None = None


class BookInList(SQLModel):
    id: UUID
    title: str
    cover_path: str | None
    short_description: str | None
    author_id: UUID | None
    author_name: str | None
    shelf_id: UUID | None
    shelf_name: str | None
    tag_ids: list[UUID] = []
    tag_names: list[str] = []


class BookDetail(SQLModel):
    id: UUID
    title: str
    cover_path: str | None
    short_description: str | None
    full_description: str | None
    author_id: UUID | None
    author_name: str | None
    shelf_id: UUID | None
    shelf_name: str | None
    tag_ids: list[UUID] = []
    tag_names: list[str] = []


class ListBooksResponse(SQLModel):
    books: list[BookInList]
    pagination: Pagination
