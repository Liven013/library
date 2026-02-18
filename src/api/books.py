from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from src.core.container import get_books_service
from src.core.covers import save_cover
from src.models.base import PaginationRequest
from src.models.books import Book, BookCreate, BookDetail, BookUpdate, ListBooksResponse
from src.services.books import BooksService

router = APIRouter(prefix="/books", tags=["books"])


def _parse_uuid_or_none(value: str | None) -> UUID | None:
    if value is None or value.strip() == "":
        return None
    try:
        return UUID(value)
    except ValueError:
        return None


def _parse_uuid_list(value: str | None) -> list[UUID]:
    if value is None or value.strip() == "":
        return []
    result = []
    for part in value.strip().split(","):
        part = part.strip()
        if part:
            try:
                result.append(UUID(part))
            except ValueError:
                pass
    return result


@router.post("/")
async def add_book(
    title: str = Form(...),
    short_description: str | None = Form(None),
    full_description: str | None = Form(None),
    author_id: str | None = Form(None),
    shelf_id: str | None = Form(None),
    tag_ids: str | None = Form(None),
    cover: UploadFile | None = File(None),
    service: BooksService = Depends(get_books_service),
) -> Book:
    title_clean = title.strip()
    if not title_clean:
        raise HTTPException(status_code=400, detail="Название книги не может быть пустым")
    cover_path = None
    if cover and cover.filename:
        cover_path = await save_cover(cover, name_without_ext=str(uuid4()))
    book_data = BookCreate(
        title=title_clean,
        short_description=short_description.strip() if short_description else None,
        full_description=full_description.strip() if full_description else None,
        author_id=_parse_uuid_or_none(author_id),
        shelf_id=_parse_uuid_or_none(shelf_id),
        tag_ids=_parse_uuid_list(tag_ids),
        cover_path=cover_path,
    )
    return await service.add_book(book_data)


@router.get("/", response_model=ListBooksResponse)
async def list_books(
    service: BooksService = Depends(get_books_service),
    pagination: PaginationRequest = Depends(),
    q: str | None = Query(None, description="Поиск по названию (без учёта регистра)"),
):
    return await service.list_books(pagination, search_q=q)


@router.get("/{book_id}", response_model=BookDetail)
async def get_book(
    book_id: UUID,
    service: BooksService = Depends(get_books_service),
) -> BookDetail:
    book = await service.get_book_detail(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.patch("/{book_id}", response_model=Book)
async def update_book(
    book_id: UUID,
    title: str | None = Form(None),
    short_description: str | None = Form(None),
    full_description: str | None = Form(None),
    author_id: str | None = Form(None),
    shelf_id: str | None = Form(None),
    tag_ids: str | None = Form(None),
    cover: UploadFile | None = File(None),
    service: BooksService = Depends(get_books_service),
) -> Book:
    book = await service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    cover_path = None
    if cover and cover.filename:
        cover_path = await save_cover(cover, name_without_ext=str(book_id))
    updates = {}
    if title is not None:
        t = title.strip()
        if not t:
            raise HTTPException(status_code=400, detail="Название книги не может быть пустым")
        updates["title"] = t
    if short_description is not None:
        updates["short_description"] = short_description.strip() or None
    if full_description is not None:
        updates["full_description"] = full_description.strip() or None
    if author_id is not None:
        updates["author_id"] = _parse_uuid_or_none(author_id)
    if shelf_id is not None:
        updates["shelf_id"] = _parse_uuid_or_none(shelf_id)
    if tag_ids is not None:
        updates["tag_ids"] = _parse_uuid_list(tag_ids)
    if cover_path is not None:
        updates["cover_path"] = cover_path
    data = BookUpdate(**updates)
    updated = await service.update_book(book_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Book not found")
    return updated


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: UUID,
    service: BooksService = Depends(get_books_service),
):
    deleted = await service.delete_book(book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Book not found")
