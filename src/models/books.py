from uuid import uuid4, UUID

from sqlmodel import Field, SQLModel, Text

from src.models.base import Pagination


class Book(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    title: str = Field(index=True)
    description: str | None = Field(sa_type=Text)
    author_id: UUID | None = Field(default=None, foreign_key="author.id")
    publishing_year: int | None = Field(default=None)

    model_config = {"from_attributes": True}


class BookCreate(SQLModel):
    title: str
    description: str | None = None
    author_id: UUID | None = None
    publishing_year: int | None = None


class BookUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    author_id: UUID | None = None
    publishing_year: int | None = None


class ListBooksResponse(SQLModel):
    books: list[Book]
    pagination: Pagination
