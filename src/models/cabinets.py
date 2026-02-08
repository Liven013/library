from __future__ import annotations

from uuid import uuid4, UUID

from sqlmodel import Field, SQLModel

from src.models.base import Pagination


class Cabinet(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str = Field(index=True)

    model_config = {"from_attributes": True}


class CabinetCreate(SQLModel):
    name: str


class CabinetUpdate(SQLModel):
    name: str | None = None


class ListCabinetsResponse(SQLModel):
    cabinets: list[Cabinet]
    pagination: Pagination
