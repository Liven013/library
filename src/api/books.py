from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from src.core.container import get_books_service
from src.models.base import PaginationRequest
from src.models.books import Book, BookCreate, BookUpdate, ListBooksResponse
from src.services.books import BooksService

router = APIRouter(prefix="/books", tags=["books"])


@router.post("/")
async def add_book(
    book: BookCreate,
    service: BooksService = Depends(get_books_service),
) -> Book:
    return await service.add_book(book)


@router.get("/", response_model=ListBooksResponse)
async def list_books(
    service: BooksService = Depends(get_books_service),
    pagination: PaginationRequest = Depends(),
):
    return await service.list_books(pagination)


@router.get("/{book_id}", response_model=Book)
async def get_book(
    book_id: UUID,
    service: BooksService = Depends(get_books_service),
) -> Book:
    book = await service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.patch("/{book_id}", response_model=Book)
async def update_book(
    book_id: UUID,
    data: BookUpdate,
    service: BooksService = Depends(get_books_service),
) -> Book:
    book = await service.update_book(book_id, data)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: UUID,
    service: BooksService = Depends(get_books_service),
):
    deleted = await service.delete_book(book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Book not found")
