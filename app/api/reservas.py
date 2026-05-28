from datetime import date, datetime, time, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.reserva import ReservaCreate, ReservaOut, ReservaUpdate
from app.crud.reservas import (
    get_reserva,
    get_reservas,
    get_reservas_por_usuario,
    create_reserva,
    update_reserva,
    delete_reserva,
)
from app.crud.espacios import get_espacio
from app.auth.roles import admin_required, usuario_required
from app.models import Usuario

router = APIRouter(prefix="/reservas", tags=["Reservas"])


def validar_reglas_negocio(
    db: Session,
    espacio_id: int,
    fecha: date,
    hora_inicio: time,
    hora_fin: time,
    cantidad_asistentes: int,
    reserva_id_excluir: int | None = None,
):
    # Regla F: hora inicio < hora fin
    if hora_inicio >= hora_fin:
        raise HTTPException(
            status_code=400,
            detail="La hora de inicio debe ser anterior a la hora de fin",
        )

    # Regla E: horario permitido
    dia_semana = fecha.weekday()  # 0=lunes, 6=domingo
    if dia_semana == 6:
        raise HTTPException(
            status_code=400,
            detail="No se permiten reservas los domingos",
        )

    if dia_semana == 5:  # sábado
        if hora_inicio < time(8, 0) or hora_fin > time(12, 0):
            raise HTTPException(
                status_code=400,
                detail="Los sábados solo se permite reservar de 8:00 a.m. a 12:00 m.",
            )
    else:  # lunes a viernes
        if hora_inicio < time(7, 0) or hora_fin > time(20, 0):
            raise HTTPException(
                status_code=400,
                detail="Los días de semana solo se permite reservar de 7:00 a.m. a 8:00 p.m.",
            )

    # Regla D: mínimo 24 horas de anticipación
    now = datetime.now(timezone.utc)
    fecha_hora_reserva = datetime.combine(fecha, hora_inicio)
    if fecha_hora_reserva.replace(tzinfo=timezone.utc) < now + timedelta(hours=24):
        raise HTTPException(
            status_code=400,
            detail="La reserva debe realizarse con al menos 24 horas de anticipación",
        )

    # Regla G: no reservar espacios inactivos
    espacio = get_espacio(db, espacio_id)
    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    if espacio.estado in ("inactivo", "en mantenimiento", "no disponible"):
        raise HTTPException(
            status_code=400,
            detail=f"No se puede reservar un espacio en estado '{espacio.estado}'",
        )

    # Regla H: capacidad máxima
    if cantidad_asistentes > espacio.capacidad:
        raise HTTPException(
            status_code=400,
            detail=f"La cantidad de asistentes ({cantidad_asistentes}) supera la capacidad del espacio ({espacio.capacidad})",
        )

    # Regla C: no permitir reservas superpuestas
    from app.models import Reserva

    query = db.query(Reserva).filter(
        Reserva.id_espacio == espacio_id,
        Reserva.fecha == fecha,
        Reserva.estado.in_(["esperando", "aprobada"]),
        Reserva.hora_inicio < hora_fin,
        Reserva.hora_fin > hora_inicio,
    )
    if reserva_id_excluir:
        query = query.filter(Reserva.id_reserva != reserva_id_excluir)

    if query.first() is not None:
        raise HTTPException(
            status_code=400,
            detail="El espacio ya tiene una reserva en ese horario",
        )


@router.get("/", response_model=list[ReservaOut])
def listar_reservas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_required),
):
    # Regla: usuario ve sus reservas, admin ve todas
    if current_user.rol == "admin":
        return get_reservas(db)
    return get_reservas_por_usuario(db, current_user.id_usuario)


@router.get("/{reserva_id}", response_model=ReservaOut)
def obtener_reserva(
    reserva_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_required),
):
    reserva = get_reserva(db, reserva_id)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Usuario solo ve sus propias reservas
    if current_user.rol != "admin" and reserva.id_usuario != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta reserva")
    return reserva


@router.post("/", response_model=ReservaOut, status_code=status.HTTP_201_CREATED)
def crear_reserva(
    reserva_data: ReservaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_required),
):
    # Regla A: el usuario autenticado es quien crea
    reserva_data.id_usuario = current_user.id_usuario
    validar_reglas_negocio(
        db,
        reserva_data.id_espacio,
        reserva_data.fecha,
        reserva_data.hora_inicio,
        reserva_data.hora_fin,
        reserva_data.cantidad_asistentes,
    )
    return create_reserva(db, reserva_data)


@router.put("/{reserva_id}/estado", response_model=ReservaOut)
def actualizar_estado_reserva(
    reserva_id: int,
    nuevo_estado: str,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(admin_required),
):
    # Regla B e I: solo admin puede aprobar o rechazar
    if nuevo_estado not in ("aprobada", "rechazada"):
        raise HTTPException(
            status_code=400,
            detail="El estado solo puede cambiarse a 'aprobada' o 'rechazada'",
        )

    reserva = get_reserva(db, reserva_id)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if reserva.estado != "esperando":
        raise HTTPException(
            status_code=400,
            detail=f"No se puede cambiar el estado de una reserva '{reserva.estado}'",
        )

    return update_reserva(db, reserva_id, ReservaUpdate(estado=nuevo_estado))


@router.delete("/{reserva_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_reserva(
    reserva_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_required),
):
    reserva = get_reserva(db, reserva_id)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Usuario cancela sus propias reservas, admin cancela cualquiera
    if current_user.rol != "admin" and reserva.id_usuario != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No puedes cancelar esta reserva")

    if not delete_reserva(db, reserva_id):
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
