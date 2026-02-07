import uvicorn
from fastapi import FastAPI

from src.api.authors import router as authors_router
from src.api.books import router as books_router


def create_app() -> FastAPI:
    app = FastAPI(title="Library API")
    app.include_router(books_router)
    app.include_router(authors_router)
    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=False)
