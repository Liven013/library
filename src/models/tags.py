from uuid import uuid4, UUID

from sqlmodel import Field, SQLModel

from src.models.base import Pagination


class Tag(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str = Field(index=True, unique=True)

    model_config = {"from_attributes": True}


class TagCreate(SQLModel):
    name: str


class TagUpdate(SQLModel):
    name: str | None = None


class ListTagsResponse(SQLModel):
    tags: list[Tag]
    pagination: Pagination
