from pydantic import BaseModel, EmailStr


class UsuarioBase(BaseModel):
    nombre: str
    correo: str
    rol: str = "usuario"


class UsuarioCreate(UsuarioBase):
    contraseña: str


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    correo: str | None = None
    contraseña: str | None = None
    rol: str | None = None


class UsuarioOut(UsuarioBase):
    id_usuario: int

    class Config:
        from_attributes = True
