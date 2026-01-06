from fastapi import FastAPI
from src.api.books import router as book_router
import uvicorn

def create_app() -> FastAPI:
    app = FastAPI(title="Library API")
    app.include_router(book_router)
    return app

app = create_app() 

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
