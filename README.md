# Библиотека

REST API и веб-интерфейс для управления книгами и авторами. Бэкенд на **FastAPI**, асинхронная работа с **PostgreSQL** через **SQLModel** и **Alembic**. Фронтенд на **React** (Vite).

## Содержание

- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Подробные инструкции по запуску](#подробные-инструкции-по-запуску)
- [Доступ к приложению](#доступ-к-приложению)
- [Структура проекта](#структура-проекта)
- [База данных и миграции](#база-данных-и-миграции)
- [API](#api)
- [Архитектура](#архитектура)

---

## Требования

- **Python 3.10+** — бэкенд
- **Node.js 18+** (и npm) — фронтенд
- **PostgreSQL 15** — через [Docker](https://www.docker.com/) или установленный локально
- Файл зависимостей бэкенда: `requirements.txt`

---

## Быстрый старт

1. **Запустить PostgreSQL** (из корня проекта):
   ```bash
   docker-compose up -d
   ```

2. **Бэкенд** — виртуальное окружение, зависимости, миграции, запуск:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   run-backend.bat
   ```
   Или вместо `run-backend.bat`:  
   `python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload`

3. **Фронтенд** — в **новом** терминале (без активации `.venv`):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Открыть в браузере: **http://localhost:5173**

---

## Подробные инструкции по запуску

### 1. Клонирование и переход в проект

```bash
cd c:\dev\projects\library
```

### 2. База данных (PostgreSQL)

Запуск через Docker (рекомендуется):

```bash
docker-compose up -d
```

Параметры по умолчанию: пользователь `user`, пароль `password`, база `mydb`, порт `5432`.  
Строка подключения в коде: `postgresql+asyncpg://user:password@localhost:5432/mydb` (настраивается в `src/core/database.py`).

Если PostgreSQL установлен отдельно — создайте базу и при необходимости измените `DATABASE_URL` в `src/core/database.py`.

### 3. Бэкенд (FastAPI)

Из **корня** проекта:

```bash
# Создать виртуальное окружение
python -m venv .venv

# Активировать (Windows)
.venv\Scripts\activate

# Linux/macOS:
# source .venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Применить миграции
alembic upgrade head
```

Запуск API:

- **Вариант А** — скрипт (удобно на Windows):
  ```bash
  run-backend.bat
  ```
  Остановка: закрыть окно терминала или `Ctrl+C`.

- **Вариант Б** — вручную:
  ```bash
  python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
  ```

Бэкенд будет доступен на порту **8000**. Документация:

- Swagger: http://localhost:8000/docs  
- ReDoc: http://localhost:8000/redoc  

### 4. Фронтенд (React + Vite)

В **новом** терминале (активировать `.venv` не обязательно):

```bash
cd frontend
npm install
npm run dev
```

Фронтенд запустится на порту **5173**. В браузере откройте **http://localhost:5173**.

Запросы к API идут через прокси Vite (`/api` → бэкенд на порту 8000), отдельно настраивать адрес бэкенда не нужно.

### 5. Порядок запуска

1. PostgreSQL (Docker или локальный сервер).  
2. Бэкенд (в одном терминале).  
3. Фронтенд (в другом терминале).  
4. Открыть http://localhost:5173.

---

## Доступ к приложению

- **Локально:** http://localhost:5173 (интерфейс), http://localhost:8000/docs (API).
- **По локальной сети:** бэкенд и фронт уже настроены на приём подключений по сети (`host: 0.0.0.0`). На ПК, где всё запущено, узнайте свой IP (например, `ipconfig` → IPv4). С другого устройства в той же сети откройте в браузере:
  ```
  http://<IP_вашего_ПК>:5173
  ```
  Пример: `http://192.168.1.5:5173`.  
  Если не открывается — проверьте брандмауэр (разрешить входящие на порты **5173** и **8000**).

---

## Структура проекта

```
library/
├── frontend/                # React (Vite)
│   ├── src/
│   │   ├── api/             # Запросы к бэкенду
│   │   ├── components/      # Layout, Modal
│   │   └── pages/           # Книги, Авторы
│   ├── package.json
│   └── vite.config.js
├── src/                     # Бэкенд FastAPI
│   ├── api/                 # Эндпоинты (books, authors)
│   ├── core/                # database, container
│   ├── models/              # SQLModel и Pydantic
│   ├── repositories/        # Доступ к БД
│   ├── services/            # Бизнес-логика
│   └── main.py
├── alembic/                 # Миграции БД
├── docker-compose.yml       # PostgreSQL
├── requirements.txt         # Зависимости Python
├── run-backend.bat          # Запуск бэкенда (Windows)
└── README.md
```

---

## База данных и миграции

### Применение миграций

```bash
alembic upgrade head
```

### Создание новой миграции

```bash
alembic revision --autogenerate -m "Описание изменений"
```

### Откат на одну ревизию

```bash
alembic downgrade -1
```

В `alembic/env.py` должны быть импортированы все табличные модели (`Book`, `Author` и т.д.).

---

## API

### Книги (`/books`)

| Метод    | Путь            | Описание           |
|----------|-----------------|--------------------|
| `POST`   | `/books/`       | Добавить книгу     |
| `GET`    | `/books/`       | Список (пагинация)|
| `GET`    | `/books/{id}`   | Одна книга         |
| `PATCH`  | `/books/{id}`   | Обновить           |
| `DELETE` | `/books/{id}`   | Удалить            |

### Авторы (`/authors`)

| Метод    | Путь              | Описание           |
|----------|-------------------|--------------------|
| `POST`   | `/authors/`       | Добавить автора    |
| `GET`    | `/authors/`       | Список (пагинация)|
| `GET`    | `/authors/{id}`   | Один автор         |
| `PATCH`  | `/authors/{id}`   | Обновить           |
| `DELETE` | `/authors/{id}`  | Удалить            |

Пагинация: параметры `page` (по умолчанию 1) и `per_page` (по умолчанию 10).

Модели: см. Swagger http://localhost:8000/docs или исходный код в `src/models/`.

---

## Архитектура

- **API** (`src/api/`) — FastAPI-роутеры, валидация, внедрение сервисов через `Depends`.
- **Services** (`src/services/`) — бизнес-логика, вызов репозиториев и пагинации.
- **Repositories** (`src/repositories/`) — CRUD и сессии БД (декоратор `with_session` из `core/database.py`).
- **База** — SQLAlchemy 2.0 async, `async_sessionmaker`, `expire_on_commit=False` для async.
