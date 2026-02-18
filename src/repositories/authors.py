from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import with_session
from src.models.authors import Author, AuthorCreate, AuthorUpdate
from src.models.base import PaginationRequest


def _escape_like(s: str) -> str:
    """Экранирует символы % и _ для использования в LIKE/ILIKE."""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


class AuthorsRepository:
    """Репозиторий для работы с Author через SQLModel ORM (SQLAlchemy 2.0 style)."""

    @with_session
    async def add(
        self,
        author_create: AuthorCreate,
        session: AsyncSession,
    ) -> Author:
        author = Author(**(author_create.model_dump()))
        session.add(author)
        await session.flush()
        await session.refresh(author)
        return author

    @with_session
    async def get_by_id(
        self,
        author_id: UUID,
        session: AsyncSession,
    ) -> Author | None:
        return await session.get(Author, author_id)

    @with_session
    async def list(
        self,
        pagination: PaginationRequest,
        session: AsyncSession,
        search_q: str | None = None,
    ) -> tuple[list[Author], int]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page

        stmt = select(Author).order_by(Author.name)
        count_stmt = select(func.count(Author.id))

        if search_q and (q := search_q.strip()):
            # Одно из слов в имени начинается с фрагмента (без учёта регистра)
            esc = _escape_like(q)
            cond = or_(
                Author.name.ilike(esc + "%"),
                Author.name.ilike("% " + esc + "%"),
            )
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)

        total_count = await session.scalar(count_stmt) or 0
        stmt = stmt.offset(offset).limit(limit)
        result = await session.scalars(stmt)
        authors = list(result.all())
        return authors, total_count

    @with_session
    async def update(
        self,
        author_id: UUID,
        data: AuthorUpdate,
        session: AsyncSession,
    ) -> Author | None:
        author = await self.get_by_id(author_id, session=session)
        if not author:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(author, field, value)
        await session.flush()
        await session.refresh(author)
        return author

    @with_session
    async def delete(
        self,
        author_id: UUID,
        session: AsyncSession,
    ) -> bool:
        author = await self.get_by_id(author_id, session=session)
        if not author:
            return False
        await session.delete(author)
        await session.flush()
        return True
