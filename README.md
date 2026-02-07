# Library API

REST API для управления книгами в библиотеке. Реализован на **FastAPI** с асинхронной работой с **PostgreSQL** через **SQLModel** и **Alembic** для миграций.

## Содержание

- [Структура проекта](#структура-проекта)
- [Требования](#требования)
- [Установка и запуск](#установка-и-запуск)
- [База данных и миграции](#база-данных-и-миграции)
- [API](#api)
- [Архитектура](#архитектура)

---


## Структура проекта

```
library/
├── alembic/                 # Миграции БД
│   ├── env.py               # Окружение Alembic (импорт моделей)
│   └── versions/            # Файлы миграций
├── src/
│   ├── api/                 # Эндпоинты FastAPI
│   │   └── books.py         # Роутер /books
│   ├── core/                # Ядро приложения
│   │   ├── container.py     # DI-контейнер (punq)
│   │   ├── database.py     # Подключение к БД, сессии, декоратор with_session
│   │   └── dependencies.py # Инъекция зависимостей для FastAPI
│   ├── models/              # Модели SQLModel и Pydantic
│   │   ├── base.py          # PaginationRequest, Pagination
│   │   ├── books.py         # Book, BookCreate, BookUpdate, ListBooksResponse
│   │   └── authors.py       # Author
│   ├── repositories/        # Слой доступа к данным
│   │   └── books.py         # BooksRepository
│   ├── services/            # Бизнес-логика
│   │   └── books.py         # BooksService
│   ├── utils/
│   │   └── pagination.py    # Построение пагинации
│   └── main.py              # Точка входа, создание FastAPI-приложения
├── docker-compose.yml       # PostgreSQL в контейнере
├── alembic.ini              # Конфигурация Alembic
└── README.md
```

---

## Требования

- Python 3.10+
- PostgreSQL 15 (или через Docker)
- Зависимости: `fastapi`, `uvicorn`, `sqlmodel`, `sqlalchemy[asyncio]`, `asyncpg`, `punq`, `alembic`

---

## Установка и запуск

### 1. Виртуальное окружение и зависимости

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/macOS

pip install fastapi uvicorn sqlmodel sqlalchemy[asyncio] asyncpg punq alembic
```

При использовании **Poetry** или **pip-tools** создайте соответствующий `pyproject.toml` или `requirements.txt` с этими пакетами.

### 2. Запуск PostgreSQL

```bash
docker-compose up -d
```

БД: пользователь `user`, пароль `password`, база `mydb`, порт `5432`. URL подключения задаётся в `src/core/database.py`:

```
postgresql+asyncpg://user:password@localhost:5432/mydb
```

### 3. Применение миграций

```bash
alembic upgrade head
```

### 4. Запуск API

Из корня проекта (важно для корректных импортов):

```bash
python -m uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
```

Или:

```bash
python src/main.py
```

Документация API после запуска:

- Swagger UI: http://127.0.0.1:8000/docs  
- ReDoc: http://127.0.0.1:8000/redoc  

---

## База данных и миграции

### Импорт моделей для Alembic

В `alembic/env.py` должны быть импортированы все табличные модели (например, `Book`, `Author`), чтобы Alembic видел метаданные и мог автогенерировать миграции.

### Создание новой миграции

```bash
alembic revision --autogenerate -m "Описание изменений"
```

Примеры сообщений: `"Make author_id nullable"`, `"Add description column"`.

### Применение миграций

```bash
alembic upgrade head
```

### Откат на одну ревизию

```bash
alembic downgrade -1
```

---

## API

### Книги (`/books`)

| Метод   | Путь       | Описание                    |
|--------|------------|-----------------------------|
| `POST` | `/books/`  | Добавить книгу              |
| `GET`  | `/books/`  | Список книг (с пагинацией)  |
| `GET`  | `/books/{book_id}` | Получить книгу по ID |
| `PATCH`| `/books/{book_id}` | Обновить книгу        |
| `DELETE` | `/books/{book_id}` | Удалить книгу      |

### Авторы (`/authors`)

| Метод   | Путь         | Описание                       |
|--------|--------------|--------------------------------|
| `POST` | `/authors/`  | Добавить автора                |
| `GET`  | `/authors/`  | Список авторов (с пагинацией)  |
| `GET`  | `/authors/{author_id}` | Получить автора по ID (UUID) |
| `PATCH`| `/authors/{author_id}` | Обновить автора             |
| `DELETE` | `/authors/{author_id}` | Удалить автора (204)     |

`author_id` в пути — UUID, например: `550e8400-e29b-41d4-a716-446655440000`.

### Пагинация (GET /books/, GET /authors/)

Параметры запроса (по умолчанию в `PaginationRequest`):

- `page` — номер страницы (по умолчанию 1)
- `per_page` — записей на странице (по умолчанию 10)

Ответ содержит список `books` и объект `pagination` с полями `current_page`, `total_pages`.

### Модели

**Книга**

- **Book** (ответ): `id` (UUID), `title`, `description`, `author_id` (UUID, опционально), `publishing_year`
- **BookCreate** (создание): `title`, `description`, `author_id`, `publishing_year`
- **BookUpdate** (обновление): те же поля, все опционально

**Автор**

- **Author** (ответ): `id` (UUID), `name`
- **AuthorCreate** (создание): `name`
- **AuthorUpdate** (обновление): `name` (опционально)

---

## Архитектура

- **API** (`src/api/`) — обработка HTTP, валидация через Pydantic/SQLModel, внедрение сервисов через `Depends(get_books_service)`.
- **Services** (`src/services/`) — бизнес-логика, оркестрация вызовов репозиториев и утилит (например, пагинация).
- **Repositories** (`src/repositories/`) — работа с БД: CRUD через SQLModel, сессии через декоратор `with_session` из `core/database.py`.
- **DI** — контейнер **punq** в `core/container.py`: регистрация `BooksRepository` и `BooksService`, резолв `BooksService` для эндпоинтов.
- **База** — асинхронный движок SQLAlchemy (`create_async_engine`), `async_sessionmaker`, контекстный менеджер `session_scope()` и декоратор `with_session` для единообразной работы с сессией в репозиториях.

---

## Лицензия

При необходимости укажите лицензию проекта.