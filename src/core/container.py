from fastapi import Depends

from src.repositories.authors import AuthorsRepository
from src.repositories.books import BooksRepository
from src.services.authors import AuthorsService
from src.services.books import BooksService


def get_books_repository() -> BooksRepository:
    return BooksRepository()


def get_authors_repository() -> AuthorsRepository:
    return AuthorsRepository()


def get_books_service(
    repo: BooksRepository = Depends(get_books_repository),
) -> BooksService:
    return BooksService(repo)


def get_authors_service(
    repo: AuthorsRepository = Depends(get_authors_repository),
) -> AuthorsService:
    return AuthorsService(repo)
