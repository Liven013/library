from uuid import uuid4, UUID

from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import with_session
from src.models.authors import Author, AuthorCreate, AuthorUpdate
from src.models.base import PaginationRequest


class AuthorsRepository:
    """Репозиторий для работы с Author через SQLModel ORM."""

    @with_session
    async def add(
        self,
        author_create: AuthorCreate,
        session: AsyncSession,
    ) -> Author:
        author = Author(id=uuid4(), **(author_create.model_dump()))
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
        result = await session.exec(select(Author).where(Author.id == author_id))
        return result.first()

    @with_session
    async def list(
        self,
        pagination: PaginationRequest,
        session: AsyncSession,
    ) -> tuple[list[Author], int]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page

        total_count_result = await session.exec(select(func.count(Author.id)))
        total_count = total_count_result.one()

        query = select(Author).offset(offset).limit(limit)
        result = await session.exec(query)
        authors = result.all()
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
