from uuid import UUID

from src.models.base import PaginationRequest
from src.models.cabinets import Cabinet, CabinetCreate, CabinetUpdate, ListCabinetsResponse
from src.repositories.cabinets import CabinetsRepository
from src.utils.pagination import build_pagination


class CabinetsService:
    def __init__(self, repo: CabinetsRepository) -> None:
        self.repository = repo

    async def add_cabinet(self, cabinet: CabinetCreate) -> Cabinet:
        return await self.repository.add(cabinet)

    async def get_cabinet(self, cabinet_id: UUID) -> Cabinet | None:
        return await self.repository.get_by_id(cabinet_id)

    async def list_cabinets(
        self,
        pagination: PaginationRequest,
        search_q: str | None = None,
    ) -> ListCabinetsResponse:
        cabinets, total_count = await self.repository.list(pagination, search_q=search_q)
        pagination_response = build_pagination(
            total_count=total_count,
            pagination_request=pagination,
        )
        return ListCabinetsResponse(cabinets=cabinets, pagination=pagination_response)

    async def list_all_cabinets(self) -> list[Cabinet]:
        return await self.repository.list_all()

    async def update_cabinet(
        self,
        cabinet_id: UUID,
        data: CabinetUpdate,
    ) -> Cabinet | None:
        return await self.repository.update(cabinet_id, data)

    async def delete_cabinet(self, cabinet_id: UUID) -> bool:
        return await self.repository.delete(cabinet_id)
