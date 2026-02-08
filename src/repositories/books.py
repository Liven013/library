from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import with_session
from src.models.authors import Author
from src.models.books import (
    Book,
    BookCreate,
    BookDetail,
    BookInList,
    BookTagLink,
    BookUpdate,
)
from src.models.shelves import Shelf
from src.models.tags import Tag
from src.models.base import PaginationRequest


def _book_create_to_row(book_create: BookCreate) -> dict:
    data = book_create.model_dump(exclude={"tag_ids"})
    return data


def _book_update_to_row(data: BookUpdate) -> dict:
    return data.model_dump(exclude_unset=True, exclude={"tag_ids"})


class BooksRepository:
    @with_session
    async def add(
        self,
        book_create: BookCreate,
        session: AsyncSession,
    ) -> Book:
        row = _book_create_to_row(book_create)
        book = Book(**row)
        session.add(book)
        await session.flush()
        for tag_id in book_create.tag_ids or []:
            session.add(BookTagLink(book_id=book.id, tag_id=tag_id))
        await session.flush()
        await session.refresh(book)
        return book

    @with_session
    async def get_by_id(
        self,
        book_id: UUID,
        session: AsyncSession,
    ) -> Book | None:
        return await session.get(Book, book_id)

    @with_session
    async def get_detail(
        self,
        book_id: UUID,
        session: AsyncSession,
    ) -> BookDetail | None:
        book = await session.get(Book, book_id)
        if not book:
            return None
        author_name = None
        if book.author_id:
            author = await session.get(Author, book.author_id)
            author_name = author.name if author else None
        shelf_name = None
        if book.shelf_id:
            shelf = await session.get(Shelf, book.shelf_id)
            shelf_name = shelf.name if shelf else None
        rows = (await session.execute(
            select(BookTagLink.tag_id, Tag.name).join(Tag, BookTagLink.tag_id == Tag.id).where(BookTagLink.book_id == book_id)
        )).all()
        tag_ids = [r[0] for r in rows]
        tag_names = [r[1] for r in rows]
        return BookDetail(
            id=book.id,
            title=book.title,
            cover_path=book.cover_path,
            short_description=book.short_description,
            full_description=book.full_description,
            author_id=book.author_id,
            author_name=author_name,
            shelf_id=book.shelf_id,
            shelf_name=shelf_name,
            tag_ids=tag_ids,
            tag_names=tag_names,
        )

    @with_session
    async def list(
        self,
        pagination: PaginationRequest,
        session: AsyncSession,
    ) -> tuple[list[BookInList], int]:
        offset = (pagination.page - 1) * pagination.per_page
        limit = pagination.per_page
        total_count = await session.scalar(select(func.count(Book.id))) or 0
        stmt = (
            select(Book, Author.name.label("author_name"), Shelf.name.label("shelf_name"))
            .outerjoin(Author, Book.author_id == Author.id)
            .outerjoin(Shelf, Book.shelf_id == Shelf.id)
            .order_by(Book.title)
            .offset(offset)
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = result.all()
        if not rows:
            return [], total_count
        book_ids = [r[0].id for r in rows]
        tag_stmt = (
            select(BookTagLink.book_id, BookTagLink.tag_id, Tag.name)
            .join(Tag, BookTagLink.tag_id == Tag.id)
            .where(BookTagLink.book_id.in_(book_ids))
        )
        tag_result = await session.execute(tag_stmt)
        tag_rows = tag_result.all()
        tags_by_book: dict[UUID, list[tuple[UUID, str]]] = {bid: [] for bid in book_ids}
        for book_id, tag_id, tag_name in tag_rows:
            tags_by_book[book_id].append((tag_id, tag_name))
        books_in_list = []
        for book, author_name, shelf_name in rows:
            tag_pairs = tags_by_book.get(book.id) or []
            books_in_list.append(
                BookInList(
                    id=book.id,
                    title=book.title,
                    cover_path=book.cover_path,
                    short_description=book.short_description,
                    author_id=book.author_id,
                    author_name=author_name,
                    shelf_id=book.shelf_id,
                    shelf_name=shelf_name,
                    tag_ids=[t[0] for t in tag_pairs],
                    tag_names=[t[1] for t in tag_pairs],
                )
            )
        return books_in_list, total_count

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
        row = _book_update_to_row(data)
        for field, value in row.items():
            setattr(book, field, value)
        if data.tag_ids is not None:
            existing = await session.scalars(select(BookTagLink).where(BookTagLink.book_id == book_id))
            for link in existing.all():
                await session.delete(link)
            for tag_id in data.tag_ids:
                session.add(BookTagLink(book_id=book_id, tag_id=tag_id))
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
