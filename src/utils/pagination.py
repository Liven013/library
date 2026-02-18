from math import ceil

from src.models.base import Pagination, PaginationRequest


def build_pagination(
    total_count: int,
    pagination_request: PaginationRequest,
) -> Pagination:
    """
    Создаёт объект Pagination по общему количеству записей и параметрам запроса.
    """
    per_page = max(pagination_request.per_page, 1)
    total_pages = ceil(total_count / per_page) if total_count > 0 else 1
    current_page = min(max(pagination_request.page, 1), total_pages)
    return Pagination(current_page=current_page, total_pages=total_pages)
