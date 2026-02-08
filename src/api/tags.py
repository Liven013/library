from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from src.core.container import get_tags_service
from src.models.base import PaginationRequest
from src.models.tags import ListTagsResponse, Tag, TagCreate, TagUpdate
from src.services.tags import TagsService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/all", response_model=list[Tag])
async def list_all_tags(
    service: TagsService = Depends(get_tags_service),
) -> list[Tag]:
    return await service.list_all_tags()


@router.post("/", response_model=Tag)
async def add_tag(
    tag: TagCreate,
    service: TagsService = Depends(get_tags_service),
) -> Tag:
    return await service.add_tag(tag)


@router.get("/", response_model=ListTagsResponse)
async def list_tags(
    service: TagsService = Depends(get_tags_service),
    pagination: PaginationRequest = Depends(),
) -> ListTagsResponse:
    return await service.list_tags(pagination)


@router.get("/{tag_id}", response_model=Tag)
async def get_tag(
    tag_id: UUID,
    service: TagsService = Depends(get_tags_service),
) -> Tag:
    tag = await service.get_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.patch("/{tag_id}", response_model=Tag)
async def update_tag(
    tag_id: UUID,
    data: TagUpdate,
    service: TagsService = Depends(get_tags_service),
) -> Tag:
    tag = await service.update_tag(tag_id, data)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.delete("/{tag_id}", status_code=204)
async def delete_tag(
    tag_id: UUID,
    service: TagsService = Depends(get_tags_service),
):
    deleted = await service.delete_tag(tag_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tag not found")
