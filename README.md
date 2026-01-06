для миграции моделей в SQLAlchemy

импортируем классы моделей в env.py

для обновления состояний
alembic upgrade head

миграция
alembic revision --autogenerate -m "Make author_id nullable"





