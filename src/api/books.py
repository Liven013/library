from fastapi import APIRouter, Depends
from core.container import get_books_service
from core.dependencies import inject
from models.base import PaginationRequest
from src.services.books import BooksService
from src.models.books import Book, BookCreate, BookUpdate, ListBooksResponse

router = APIRouter(prefix="/books", tags=["books"])


@router.post("/")
async def add_book(book: BookCreate, service: BooksService = Depends(get_books_service)):
    new_book = await service.add_book(book)
    return new_book


@router.get("/{book_id}", response_model=Book)
async def get_book(book_id: int, service: BooksService = Depends(get_books_service)):
    return await service.get_book(book_id)


@router.get("/", response_model=ListBooksResponse)
async def list_books(service: BooksService = Depends(get_books_service), pagination: PaginationRequest = Depends()):
    return await service.list_books(pagination)


@router.patch("/{book_id}", response_model=Book)
async def update_book(book_id: int, data: BookUpdate, service: BooksService = Depends(get_books_service)):
    return await service.update_book(book_id, data)