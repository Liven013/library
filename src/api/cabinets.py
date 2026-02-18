from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from src.core.container import get_cabinets_service
from src.models.base import PaginationRequest
from src.models.cabinets import Cabinet, CabinetCreate, CabinetUpdate, ListCabinetsResponse
from src.services.cabinets import CabinetsService

router = APIRouter(prefix="/cabinets", tags=["cabinets"])


@router.get("/all", response_model=list[Cabinet])
async def list_all_cabinets(
    service: CabinetsService = Depends(get_cabinets_service),
) -> list[Cabinet]:
    return await service.list_all_cabinets()


@router.post("/", response_model=Cabinet)
async def add_cabinet(
    cabinet: CabinetCreate,
    service: CabinetsService = Depends(get_cabinets_service),
) -> Cabinet:
    return await service.add_cabinet(cabinet)


@router.get("/", response_model=ListCabinetsResponse)
async def list_cabinets(
    service: CabinetsService = Depends(get_cabinets_service),
    pagination: PaginationRequest = Depends(),
    q: str | None = Query(None, description="Поиск по названию шкафа (без учёта регистра)"),
) -> ListCabinetsResponse:
    return await service.list_cabinets(pagination, search_q=q)


@router.get("/{cabinet_id}", response_model=Cabinet)
async def get_cabinet(
    cabinet_id: UUID,
    service: CabinetsService = Depends(get_cabinets_service),
) -> Cabinet:
    cabinet = await service.get_cabinet(cabinet_id)
    if not cabinet:
        raise HTTPException(status_code=404, detail="Cabinet not found")
    return cabinet


@router.patch("/{cabinet_id}", response_model=Cabinet)
async def update_cabinet(
    cabinet_id: UUID,
    data: CabinetUpdate,
    service: CabinetsService = Depends(get_cabinets_service),
) -> Cabinet:
    cabinet = await service.update_cabinet(cabinet_id, data)
    if not cabinet:
        raise HTTPException(status_code=404, detail="Cabinet not found")
    return cabinet


@router.delete("/{cabinet_id}", status_code=204)
async def delete_cabinet(
    cabinet_id: UUID,
    service: CabinetsService = Depends(get_cabinets_service),
):
    deleted = await service.delete_cabinet(cabinet_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cabinet not found")
