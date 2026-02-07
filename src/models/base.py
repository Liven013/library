from sqlmodel import Field, SQLModel

metadata = SQLModel.metadata


class PaginationRequest(SQLModel):
    """Параметры пагинации в запросе."""

    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1)


class Pagination(SQLModel):
    """Метаданные пагинации в ответе."""

    current_page: int = 1
    total_pages: int = 1
