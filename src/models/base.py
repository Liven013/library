from sqlmodel import SQLModel

# Alembic будет смотреть на это
metadata = SQLModel.metadata

from sqlmodel import SQLModel, Field

class PaginationRequest(SQLModel):
    """
    Модель для пагинации в запросе 
    """
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1)


class Pagination(SQLModel):
    """Базовая модель для пагинации страниц"""

    current_page: int = 1
    total_pages: int = 1