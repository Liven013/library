from models.base import PaginationRequest
from src.models.books import Book, BookCreate, BookUpdate, ListBooksResponse
from src.repositories.books import BooksRepository
from src.utils.pagination import build_pagination

class BooksService:
    def __init__(self, repo: BooksRepository):
        self.repository = repo


    async def add_book(self, book: BookCreate) -> Book:
        book = await self.repository.add(book)
        return book

    async def get_book(self, book_id: int) -> Book | None:
        await self.get_book(book_id)


    async def list_books(self, pagination: PaginationRequest) -> ListBooksResponse:
        books, total_count = await self.repository.list(pagination)
        pagination_response = build_pagination(total_count=total_count, pagination_request=pagination)
        return ListBooksResponse(books=books, pagination=pagination_response)
    

    async def update_book(self, book_id: int, data: BookUpdate) -> Book | None:
        await self.repository.update(book_id, data)
