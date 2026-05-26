from datetime import date, time
from pydantic import BaseModel


class ReservaBase(BaseModel):
    id_usuario: int
    id_espacio: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    cantidad_asistentes: int


class ReservaCreate(ReservaBase):
    pass


class ReservaUpdate(BaseModel):
    id_espacio: int | None = None
    fecha: date | None = None
    hora_inicio: time | None = None
    hora_fin: time | None = None
    cantidad_asistentes: int | None = None
    estado: str | None = None


class ReservaOut(ReservaBase):
    id_reserva: int
    estado: str

    class Config:
        from_attributes = True
