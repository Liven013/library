from fastapi import Depends

from src.repositories.authors import AuthorsRepository
from src.repositories.books import BooksRepository
from src.repositories.cabinets import CabinetsRepository
from src.repositories.shelves import ShelvesRepository
from src.repositories.tags import TagsRepository
from src.services.authors import AuthorsService
from src.services.books import BooksService
from src.services.cabinets import CabinetsService
from src.services.shelves import ShelvesService
from src.services.tags import TagsService


def get_books_repository() -> BooksRepository:
    return BooksRepository()


def get_authors_repository() -> AuthorsRepository:
    return AuthorsRepository()


def get_shelves_repository() -> ShelvesRepository:
    return ShelvesRepository()


def get_tags_repository() -> TagsRepository:
    return TagsRepository()

def get_cabinets_repository() -> CabinetsRepository:
    return CabinetsRepository()

def get_books_service(
    repo: BooksRepository = Depends(get_books_repository),
) -> BooksService:
    return BooksService(repo)


def get_authors_service(
    repo: AuthorsRepository = Depends(get_authors_repository),
) -> AuthorsService:
    return AuthorsService(repo)


def get_shelves_service(
    repo: ShelvesRepository = Depends(get_shelves_repository),
) -> ShelvesService:
    return ShelvesService(repo)


def get_cabinets_service(
    repo: CabinetsRepository = Depends(get_cabinets_repository),
) -> CabinetsService:
    return CabinetsService(repo)


def get_tags_service(
    repo: TagsRepository = Depends(get_tags_repository),
) -> TagsService:
    return TagsService(repo)
