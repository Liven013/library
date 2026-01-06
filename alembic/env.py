import sys
import asyncio
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from sqlmodel import SQLModel

# ----------------------------------------

# Импортируем модели для автогенерации
from src.models.books import Book
from src.models.authors import Author

# metadata для Alembic (SQLModel)
target_metadata = SQLModel.metadata

# Настройка логирования Alembic
config = context.config
fileConfig(config.config_file_name)

# ----------------------------------------
# Функции для offline / online миграций
# ----------------------------------------
def run_migrations_offline():
    """
    Миграции без подключения к БД
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """
    Функция для online миграций
    """
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """
    Асинхронное подключение к БД и запуск миграций
    """
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
        future=True,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

# ----------------------------------------
# Запуск миграций
# ----------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
