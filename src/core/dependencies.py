from fastapi import Depends
from typing import Type, Callable, Any
from functools import wraps
from src.core.container import container

def inject(*service_classes: Type) -> Callable:
    """
    Декоратор для автоматической инъекции сервисов из DI-контейнера
    в FastAPI endpoint через Depends.
    """
    def decorator(endpoint: Callable) -> Callable:
        # Создаём зависимости через Depends
        for cls in service_classes:
            name = cls.__name__.lower()
            # Добавляем в аннотации endpoint через Depends
            endpoint.__annotations__[name] = Depends(lambda cls=cls: container.resolve(cls))

        @wraps(endpoint)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # FastAPI передаст kwargs через Depends
            return await endpoint(*args, **kwargs)

        return wrapper

    return decorator
