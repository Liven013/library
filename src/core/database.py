from contextlib import asynccontextmanager
from functools import wraps
from typing import Any, AsyncGenerator, Callable, Coroutine

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/mydb"

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
)

AsyncSessionFactory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # нужно для async: атрибуты доступны после commit
    autocommit=False,
    autoflush=True,
)


@asynccontextmanager
async def session_scope() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def with_session(func: Callable[..., Coroutine[Any, Any, Any]]):
    """
    Декоратор для методов репозитория.
    Если session не передан, создаёт свой через session_scope().
    """

    @wraps(func)
    async def wrapper(*args, session: AsyncSession | None = None, **kwargs):
        if session is not None:
            return await func(*args, session=session, **kwargs)
        async with session_scope() as session:
            return await func(*args, session=session, **kwargs)

    return wrapper
