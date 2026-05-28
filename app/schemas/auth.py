from pydantic import BaseModel


class LoginRequest(BaseModel):
    correo: str
    contraseña: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
