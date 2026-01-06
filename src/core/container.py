from punq import Container
from src.repositories.books import BooksRepository
from src.services.books import BooksService

container = Container()

# Регистрируем репозитории
container.register(BooksRepository, scope="request")  

# Регистрируем сервисы, автоматически инжектируя репозитории
container.register(BooksService, scope="request")

def get_books_service() -> BooksService:
    return container.resolve(BooksService)