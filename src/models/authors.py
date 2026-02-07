from uuid import uuid4, UUID

from sqlmodel import Field, SQLModel

from src.models.base import Pagination


class Author(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str

    model_config = {"from_attributes": True}


class AuthorCreate(SQLModel):
    name: str


class AuthorUpdate(SQLModel):
    name: str | None = None


class ListAuthorsResponse(SQLModel):
    authors: list[Author]
    pagination: Pagination
