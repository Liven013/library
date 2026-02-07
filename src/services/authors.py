from uuid import UUID

from src.models.authors import Author, AuthorCreate, AuthorUpdate, ListAuthorsResponse
from src.models.base import PaginationRequest
from src.repositories.authors import AuthorsRepository
from src.utils.pagination import build_pagination


class AuthorsService:
    def __init__(self, repo: AuthorsRepository) -> None:
        self.repository = repo

    async def add_author(self, author: AuthorCreate) -> Author:
        return await self.repository.add(author)

    async def get_author(self, author_id: UUID) -> Author | None:
        return await self.repository.get_by_id(author_id)

    async def list_authors(
        self,
        pagination: PaginationRequest,
    ) -> ListAuthorsResponse:
        authors, total_count = await self.repository.list(pagination)
        pagination_response = build_pagination(
            total_count=total_count,
            pagination_request=pagination,
        )
        return ListAuthorsResponse(authors=authors, pagination=pagination_response)

    async def update_author(
        self,
        author_id: UUID,
        data: AuthorUpdate,
    ) -> Author | None:
        return await self.repository.update(author_id, data)

    async def delete_author(self, author_id: UUID) -> bool:
        return await self.repository.delete(author_id)
