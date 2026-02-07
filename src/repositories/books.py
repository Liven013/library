from uuid import uuid4, UUID

from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import with_session
from src.models.base import PaginationRequest
from src.models.books import Book, BookCreate, BookUpdate


class BooksRepository:
    """Репозиторий для работы с Book через SQLModel ORM."""

    @with_session
    async def add(
        self,
        book_create: BookCreate,
        session: AsyncSession,
    ) -> Book:
        book = Book(id=uuid4(), **(book_create.model_dump()))
        session.add(book)
        await session.flush()
        await session.refresh(book)
        return book

    @with_session
    async def get_by_id(
        self,
        book_id: UUID,
        session: AsyncSession,
    ) -> Book | None:
        result = await session.exec(select(Book).where(Book.id == book_id))
        return result.first()

    @with_session
    async def list(
        self,
        pagination: PaginationRequest,
        session: AsyncSession,
    ) -> tuple[list[Book], int]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page

        total_count_result = await session.exec(select(func.count(Book.id)))
        total_count = total_count_result.one()

        query = select(Book).offset(offset).limit(limit)
        result = await session.exec(query)
        books = result.all()
        return books, total_count

    @with_session
    async def update(
        self,
        book_id: UUID,
        data: BookUpdate,
        session: AsyncSession,
    ) -> Book | None:
        book = await self.get_by_id(book_id, session=session)
        if not book:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(book, field, value)
        await session.flush()
        await session.refresh(book)
        return book

    @with_session
    async def delete(
        self,
        book_id: UUID,
        session: AsyncSession,
    ) -> bool:
        book = await self.get_by_id(book_id, session=session)
        if not book:
            return False
        await session.delete(book)
        await session.flush()
        return True
