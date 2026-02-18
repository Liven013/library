from __future__ import annotations
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import with_session
from src.models.base import PaginationRequest
from src.models.tags import Tag, TagCreate, TagUpdate


def _escape_like(s: str) -> str:
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


class TagsRepository:
    @with_session
    async def add(
        self,
        tag_create: TagCreate,
        session: AsyncSession,
    ) -> Tag:
        tag = Tag(**(tag_create.model_dump()))
        session.add(tag)
        await session.flush()
        await session.refresh(tag)
        return tag

    @with_session
    async def get_by_id(
        self,
        tag_id: UUID,
        session: AsyncSession,
    ) -> Tag | None:
        return await session.get(Tag, tag_id)

    @with_session
    async def get_by_ids(
        self,
        tag_ids: list[UUID],
        session: AsyncSession,
    ) -> list[Tag]:
        if not tag_ids:
            return []
        stmt = select(Tag).where(Tag.id.in_(tag_ids))
        result = await session.scalars(stmt)
        return list(result.all())

    @with_session
    async def list(
        self,
        pagination: PaginationRequest,
        session: AsyncSession,
        search_q: str | None = None,
    ) -> tuple[list[Tag], int]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page
        stmt = select(Tag).order_by(Tag.name)
        count_stmt = select(func.count(Tag.id))
        if search_q and (q := search_q.strip()):
            esc = _escape_like(q)
            cond = or_(
                Tag.name.ilike(esc + "%"),
                Tag.name.ilike("% " + esc + "%"),
            )
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)
        total_count = await session.scalar(count_stmt) or 0
        stmt = stmt.offset(offset).limit(limit)
        result = await session.scalars(stmt)
        return list(result.all()), total_count

    @with_session
    async def list_all(self, session: AsyncSession) -> list[Tag]:
        stmt = select(Tag).order_by(Tag.name)
        result = await session.scalars(stmt)
        return list(result.all())

    @with_session
    async def update(
        self,
        tag_id: UUID,
        data: TagUpdate,
        session: AsyncSession,
    ) -> Tag | None:
        tag = await self.get_by_id(tag_id, session=session)
        if not tag:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(tag, field, value)
        await session.flush()
        await session.refresh(tag)
        return tag

    @with_session
    async def delete(
        self,
        tag_id: UUID,
        session: AsyncSession,
    ) -> bool:
        tag = await self.get_by_id(tag_id, session=session)
        if not tag:
            return False
        await session.delete(tag)
        await session.flush()
        return True
