from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from src.core.container import get_authors_service
from src.models.authors import Author, AuthorCreate, AuthorUpdate, ListAuthorsResponse
from src.models.base import PaginationRequest
from src.services.authors import AuthorsService

router = APIRouter(prefix="/authors", tags=["authors"])


@router.post("/", response_model=Author)
async def add_author(
    author: AuthorCreate,
    service: AuthorsService = Depends(get_authors_service),
) -> Author:
    return await service.add_author(author)


@router.get("/", response_model=ListAuthorsResponse)
async def list_authors(
    service: AuthorsService = Depends(get_authors_service),
    pagination: PaginationRequest = Depends(),
    q: str | None = Query(None, description="Поиск по имени (без учёта регистра)"),
):
    return await service.list_authors(pagination, search_q=q)


@router.get("/{author_id}", response_model=Author)
async def get_author(
    author_id: UUID,
    service: AuthorsService = Depends(get_authors_service),
) -> Author:
    author = await service.get_author(author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


@router.patch("/{author_id}", response_model=Author)
async def update_author(
    author_id: UUID,
    data: AuthorUpdate,
    service: AuthorsService = Depends(get_authors_service),
) -> Author:
    author = await service.update_author(author_id, data)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


@router.delete("/{author_id}", status_code=204)
async def delete_author(
    author_id: UUID,
    service: AuthorsService = Depends(get_authors_service),
):
    deleted = await service.delete_author(author_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Author not found")
