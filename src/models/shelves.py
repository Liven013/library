from __future__ import annotations

from uuid import uuid4, UUID

from pydantic import field_validator
from sqlmodel import Field, SQLModel

from src.models.base import Pagination


def _empty_str_to_none(v: UUID | None | str) -> UUID | None:
    if v is None or v == "":
        return None
    return v if isinstance(v, UUID) else UUID(str(v))


class Shelf(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str = Field(index=True)
    cabinet_id: UUID | None = Field(default=None, foreign_key="cabinet.id")

    model_config = {"from_attributes": True}


class ShelfCreate(SQLModel):
    name: str
    cabinet_id: UUID | None = None

    @field_validator("cabinet_id", mode="before")
    @classmethod
    def cabinet_id_empty_to_none(cls, v: UUID | None | str) -> UUID | None:
        return _empty_str_to_none(v)


class ShelfUpdate(SQLModel):
    name: str | None = None
    cabinet_id: UUID | None = None

    @field_validator("cabinet_id", mode="before")
    @classmethod
    def cabinet_id_empty_to_none(cls, v: UUID | None | str) -> UUID | None:
        return _empty_str_to_none(v)


class ShelfWithCabinet(SQLModel):
    id: UUID
    name: str
    cabinet_id: UUID | None
    cabinet_name: str | None


class ListShelvesResponse(SQLModel):
    shelves: list[ShelfWithCabinet]
    pagination: Pagination
