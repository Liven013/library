from math import ceil
from models.base import Pagination, PaginationRequest


def build_pagination(total_count: int, pagination_request: PaginationRequest) -> Pagination:
    """
    Создаёт объект Pagination на основе общего количества элементов
    и запроса пагинации.
    
    Args:
        total_count (int): общее количество элементов в таблице
        pagination_request (PaginationRequest): параметры page и per_page

    Returns:
        Pagination: объект с current_page и total_pages
    """
    # Защита от деления на ноль
    per_page = max(pagination_request.per_page, 1)

    total_pages = ceil(total_count / per_page) if total_count > 0 else 1

    # Текущая страница не может быть больше total_pages
    current_page = min(max(pagination_request.page, 1), total_pages)

    return Pagination(current_page=current_page, total_pages=total_pages)
