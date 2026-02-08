from uuid import UUID

from src.models.base import PaginationRequest
from src.models.shelves import ListShelvesResponse, Shelf, ShelfCreate, ShelfUpdate, ShelfWithCabinet
from src.repositories.shelves import ShelvesRepository
from src.utils.pagination import build_pagination


class ShelvesService:
    def __init__(self, repo: ShelvesRepository) -> None:
        self.repository = repo

    async def add_shelf(self, shelf: ShelfCreate) -> Shelf:
        return await self.repository.add(shelf)

    async def get_shelf(self, shelf_id: UUID) -> Shelf | None:
        return await self.repository.get_by_id(shelf_id)

    async def list_shelves(
        self,
        pagination: PaginationRequest,
    ) -> ListShelvesResponse:
        shelves, total_count = await self.repository.list(pagination)
        pagination_response = build_pagination(
            total_count=total_count,
            pagination_request=pagination,
        )
        return ListShelvesResponse(shelves=shelves, pagination=pagination_response)

    async def list_all_shelves(self) -> list[ShelfWithCabinet]:
        return await self.repository.list_all()

    async def update_shelf(
        self,
        shelf_id: UUID,
        data: ShelfUpdate,
    ) -> Shelf | None:
        return await self.repository.update(shelf_id, data)

    async def delete_shelf(self, shelf_id: UUID) -> bool:
        return await self.repository.delete(shelf_id)
