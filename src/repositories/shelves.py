from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import with_session
from src.models.base import PaginationRequest
from src.models.cabinets import Cabinet
from src.models.shelves import Shelf, ShelfCreate, ShelfUpdate, ShelfWithCabinet


class ShelvesRepository:
    @with_session
    async def add(
        self,
        shelf_create: ShelfCreate,
        session: AsyncSession,
    ) -> Shelf:
        shelf = Shelf(**(shelf_create.model_dump()))
        session.add(shelf)
        await session.flush()
        await session.refresh(shelf)
        return shelf

    @with_session
    async def get_by_id(
        self,
        shelf_id: UUID,
        session: AsyncSession,
    ) -> Shelf | None:
        return await session.get(Shelf, shelf_id)

    @with_session
    async def list(
        self,
        pagination: PaginationRequest,
        session: AsyncSession,
    ) -> tuple[list[ShelfWithCabinet], int]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page
        total_count = await session.scalar(select(func.count(Shelf.id))) or 0
        stmt = (
            select(Shelf, Cabinet.name.label("cabinet_name"))
            .outerjoin(Cabinet, Shelf.cabinet_id == Cabinet.id)
            .order_by(Shelf.cabinet_id, Shelf.name)
            .offset(offset)
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = result.all()
        return [
            ShelfWithCabinet(
                id=s.id,
                name=s.name,
                cabinet_id=s.cabinet_id,
                cabinet_name=cabinet_name,
            )
            for s, cabinet_name in rows
        ], total_count

    @with_session
    async def list_all(self, session: AsyncSession) -> list[ShelfWithCabinet]:
        stmt = (
            select(Shelf, Cabinet.name.label("cabinet_name"))
            .outerjoin(Cabinet, Shelf.cabinet_id == Cabinet.id)
            .order_by(Shelf.cabinet_id, Shelf.name)
        )
        result = await session.execute(stmt)
        rows = result.all()
        return [
            ShelfWithCabinet(
                id=s.id,
                name=s.name,
                cabinet_id=s.cabinet_id,
                cabinet_name=cabinet_name,
            )
            for s, cabinet_name in rows
        ]

    @with_session
    async def update(
        self,
        shelf_id: UUID,
        data: ShelfUpdate,
        session: AsyncSession,
    ) -> Shelf | None:
        shelf = await self.get_by_id(shelf_id, session=session)
        if not shelf:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(shelf, field, value)
        await session.flush()
        await session.refresh(shelf)
        return shelf

    @with_session
    async def delete(
        self,
        shelf_id: UUID,
        session: AsyncSession,
    ) -> bool:
        shelf = await self.get_by_id(shelf_id, session=session)
        if not shelf:
            return False
        await session.delete(shelf)
        await session.flush()
        return True
