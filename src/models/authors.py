
from uuid import uuid4, UUID
from sqlmodel import Field, SQLModel

class Author(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str

    model_config = {
        "from_attributes": True
    }
