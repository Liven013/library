from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import with_session
from src.models.base import PaginationRequest
from src.models.cabinets import Cabinet, CabinetCreate, CabinetUpdate
from src.models.shelves import Shelf


class CabinetsRepository:
    @with_session
    async def add(
        self,
        cabinet_create: CabinetCreate,
        session: AsyncSession,
    ) -> Cabinet:
        cabinet = Cabinet(**(cabinet_create.model_dump()))
        session.add(cabinet)
        await session.flush()
        await session.refresh(cabinet)
        return cabinet

    @with_session
    async def get_by_id(
        self,
        cabinet_id: UUID,
        session: AsyncSession,
    ) -> Cabinet | None:
        return await session.get(Cabinet, cabinet_id)

    @with_session
    async def list(
        self,
        pagination: PaginationRequest,
        session: AsyncSession,
    ) -> tuple[list[Cabinet], int]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page
        total_count = await session.scalar(select(func.count(Cabinet.id))) or 0
        stmt = select(Cabinet).order_by(Cabinet.name).offset(offset).limit(limit)
        result = await session.scalars(stmt)
        return list(result.all()), total_count

    @with_session
    async def list_all(self, session: AsyncSession) -> list[Cabinet]:
        stmt = select(Cabinet).order_by(Cabinet.name)
        result = await session.scalars(stmt)
        return list(result.all())

    @with_session
    async def update(
        self,
        cabinet_id: UUID,
        data: CabinetUpdate,
        session: AsyncSession,
    ) -> Cabinet | None:
        cabinet = await self.get_by_id(cabinet_id, session=session)
        if not cabinet:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(cabinet, field, value)
        await session.flush()
        await session.refresh(cabinet)
        return cabinet

    @with_session
    async def delete(
        self,
        cabinet_id: UUID,
        session: AsyncSession,
    ) -> bool:
        cabinet = await self.get_by_id(cabinet_id, session=session)
        if not cabinet:
            return False
        await session.execute(update(Shelf).where(Shelf.cabinet_id == cabinet_id).values(cabinet_id=None))
        await session.delete(cabinet)
        await session.flush()
        return True
