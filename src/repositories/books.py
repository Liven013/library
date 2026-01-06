from uuid import uuid4
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.base import PaginationRequest
from src.models.books import Book, BookCreate, BookUpdate
from src.core.database import with_session

class BooksRepository:
    """Репозиторий для работы с Book через SQLModel ORM."""
    
    @with_session
    async def add(self, book_create: BookCreate, session: AsyncSession) -> Book:
        # 1. Создаём объект Book из BookCreate
        book = Book(id=uuid4(), **book_create.dict())

        # 2. Добавляем в сессию
        session.add(book)

        # 3. Flush нужен, чтобы сгенерировался PK (id)
        await session.flush()

        # 4. Можно refresh, чтобы получить все поля из БД
        await session.refresh(book)

        return book


    @with_session
    async def get_by_id(self, book_id: str, session: AsyncSession) -> Book | None:
        result = await session.exec(
            select(Book).where(Book.id == book_id)
        )
        return result.first()

    @with_session
    async def list(self, pagination: PaginationRequest, session: AsyncSession) -> list[Book]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page

                
        total_count = await session.exec(select(func.count(Book.id)))
        total_count = total_count.one()
        
        query = select(Book).offset(offset).limit(limit)
        result = await session.exec(query)
        books = result.all()
        return books, total_count

    @with_session
    async def update(self, book_id: str, data: BookUpdate, session: AsyncSession) -> Book | None:
        book = await self.get_by_id(book_id, session=session)
        if not book:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(book, field, value)

        await session.flush()
        return book

    @with_session
    async def delete(self, book_id: str, session: AsyncSession) -> bool:
        book = await self.get_by_id(book_id, session=session)
        if not book:
            return False
        await session.delete(book)
        await session.flush()
        return True
