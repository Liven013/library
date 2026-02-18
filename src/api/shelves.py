from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from src.core.container import get_shelves_service
from src.models.base import PaginationRequest
from src.models.shelves import ListShelvesResponse, Shelf, ShelfCreate, ShelfUpdate, ShelfWithCabinet
from src.services.shelves import ShelvesService

router = APIRouter(prefix="/shelves", tags=["shelves"])


@router.get("/all", response_model=list[ShelfWithCabinet])
async def list_all_shelves(
    service: ShelvesService = Depends(get_shelves_service),
) -> list[ShelfWithCabinet]:
    return await service.list_all_shelves()


@router.post("/", response_model=Shelf)
async def add_shelf(
    shelf: ShelfCreate,
    service: ShelvesService = Depends(get_shelves_service),
) -> Shelf:
    return await service.add_shelf(shelf)


@router.get("/", response_model=ListShelvesResponse)
async def list_shelves(
    service: ShelvesService = Depends(get_shelves_service),
    pagination: PaginationRequest = Depends(),
) -> ListShelvesResponse:
    return await service.list_shelves(pagination)


@router.get("/{shelf_id}", response_model=Shelf)
async def get_shelf(
    shelf_id: UUID,
    service: ShelvesService = Depends(get_shelves_service),
) -> Shelf:
    shelf = await service.get_shelf(shelf_id)
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    return shelf


@router.patch("/{shelf_id}", response_model=Shelf)
async def update_shelf(
    shelf_id: UUID,
    data: ShelfUpdate,
    service: ShelvesService = Depends(get_shelves_service),
) -> Shelf:
    shelf = await service.update_shelf(shelf_id, data)
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    return shelf


@router.delete("/{shelf_id}", status_code=204)
async def delete_shelf(
    shelf_id: UUID,
    service: ShelvesService = Depends(get_shelves_service),
):
    deleted = await service.delete_shelf(shelf_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Shelf not found")
