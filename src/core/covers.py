"""Путь к папке обложек и сохранение загруженных файлов."""
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

COVERS_DIR = Path(__file__).resolve().parent.parent.parent / "covers"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def get_extension(filename: str) -> str:
    """Возвращает расширение файла (нижний регистр) или .jpg по умолчанию."""
    ext = Path(filename).suffix.lower()
    return ext if ext in ALLOWED_EXTENSIONS else ".jpg"


async def save_cover(upload: UploadFile, name_without_ext: str) -> str:
    """
    Сохраняет загруженный файл в COVERS_DIR.
    Возвращает относительный путь для БД, например covers/uuid.jpg.
    """
    COVERS_DIR.mkdir(exist_ok=True)
    ext = get_extension(upload.filename or "cover.jpg")
    filename = f"{name_without_ext}{ext}"
    path = COVERS_DIR / filename
    content = await upload.read()
    path.write_bytes(content)
    return f"covers/{filename}"
