from pydantic import BaseModel


class EspacioBase(BaseModel):
    nombre: str
    ubicacion: str
    capacidad: int
    estado: str = "activo"


class EspacioCreate(EspacioBase):
    pass


class EspacioUpdate(BaseModel):
    nombre: str | None = None
    ubicacion: str | None = None
    capacidad: int | None = None
    estado: str | None = None


class EspacioOut(EspacioBase):
    id_espacio: int

    class Config:
        from_attributes = True
