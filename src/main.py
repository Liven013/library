import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.api.authors import router as authors_router
from src.api.books import router as books_router
from src.api.cabinets import router as cabinets_router
from src.api.shelves import router as shelves_router
from src.api.tags import router as tags_router
from src.core.covers import COVERS_DIR


def create_app() -> FastAPI:
    app = FastAPI(title="Library API")

    COVERS_DIR.mkdir(exist_ok=True)
    app.mount("/covers", StaticFiles(directory=str(COVERS_DIR)), name="covers")

    # Для доступа по локальной сети разрешаем любые источники (в проде лучше указать конкретные).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(books_router)
    app.include_router(authors_router)
    app.include_router(cabinets_router)
    app.include_router(shelves_router)
    app.include_router(tags_router)
    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=False)
