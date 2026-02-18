from uuid import UUID

from src.models.base import PaginationRequest
from src.models.tags import ListTagsResponse, Tag, TagCreate, TagUpdate
from src.repositories.tags import TagsRepository
from src.utils.pagination import build_pagination


class TagsService:
    def __init__(self, repo: TagsRepository) -> None:
        self.repository = repo

    async def add_tag(self, tag: TagCreate) -> Tag:
        return await self.repository.add(tag)

    async def get_tag(self, tag_id: UUID) -> Tag | None:
        return await self.repository.get_by_id(tag_id)

    async def list_tags(
        self,
        pagination: PaginationRequest,
        search_q: str | None = None,
    ) -> ListTagsResponse:
        tags, total_count = await self.repository.list(pagination, search_q=search_q)
        pagination_response = build_pagination(
            total_count=total_count,
            pagination_request=pagination,
        )
        return ListTagsResponse(tags=tags, pagination=pagination_response)

    async def list_all_tags(self) -> list[Tag]:
        return await self.repository.list_all()

    async def update_tag(
        self,
        tag_id: UUID,
        data: TagUpdate,
    ) -> Tag | None:
        return await self.repository.update(tag_id, data)

    async def delete_tag(self, tag_id: UUID) -> bool:
        return await self.repository.delete(tag_id)
