from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.espacio import EspacioCreate, EspacioOut, EspacioUpdate
from app.crud.espacios import (
    get_espacio,
    get_espacios,
    create_espacio,
    update_espacio,
    delete_espacio,
)
from app.auth.roles import admin_required, usuario_required
from app.models import Usuario

router = APIRouter(prefix="/espacios", tags=["Espacios"])


@router.get("/", response_model=list[EspacioOut])
def listar_espacios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_required),
):
    return get_espacios(db, skip=skip, limit=limit)


@router.get("/{espacio_id}", response_model=EspacioOut)
def obtener_espacio(
    espacio_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_required),
):
    espacio = get_espacio(db, espacio_id)
    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return espacio


@router.post("/", response_model=EspacioOut, status_code=status.HTTP_201_CREATED)
def crear_espacio(
    espacio_data: EspacioCreate,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    return create_espacio(db, espacio_data)


@router.put("/{espacio_id}", response_model=EspacioOut)
def actualizar_espacio(
    espacio_id: int,
    espacio_data: EspacioUpdate,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    espacio = update_espacio(db, espacio_id, espacio_data)
    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return espacio


@router.delete("/{espacio_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_espacio(
    espacio_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    if not delete_espacio(db, espacio_id):
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
