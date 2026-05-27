from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.crud.usuarios import (
    get_usuario,
    get_usuarios,
    create_usuario,
    update_usuario,
    delete_usuario,
)
from app.auth.roles import admin_required
from app.models import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/", response_model=list[UsuarioOut])
def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    return get_usuarios(db, skip=skip, limit=limit)


@router.get("/{usuario_id}", response_model=UsuarioOut)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    usuario = get_usuario(db, usuario_id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario_endpoint(
    usuario_data: UsuarioCreate,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    from app.crud.usuarios import get_usuario_por_correo

    if get_usuario_por_correo(db, usuario_data.correo):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    return create_usuario(db, usuario_data)


@router.put("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(
    usuario_id: int,
    usuario_data: UsuarioUpdate,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    usuario = update_usuario(db, usuario_id, usuario_data)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    if not delete_usuario(db, usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
