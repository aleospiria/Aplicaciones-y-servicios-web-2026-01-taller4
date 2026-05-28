from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioOut
from app.schemas.auth import LoginRequest, TokenResponse
from app.crud.usuarios import get_usuario_por_correo, create_usuario
from app.auth.security import verify_password
from app.auth.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def register(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    if get_usuario_por_correo(db, usuario_data.correo):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    if usuario_data.rol not in ("admin", "usuario"):
        raise HTTPException(status_code=400, detail="Rol inválido")

    usuario = create_usuario(db, usuario_data)
    return usuario


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    usuario = get_usuario_por_correo(db, login_data.correo)
    if usuario is None or not verify_password(login_data.contraseña, usuario.contraseña):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({"sub": usuario.id_usuario, "rol": usuario.rol})
    return TokenResponse(access_token=token, token_type="bearer")
