from sqlalchemy.orm import Session
from app.models import Reserva
from app.schemas.reserva import ReservaCreate, ReservaUpdate


def get_reserva(db: Session, reserva_id: int) -> Reserva | None:
    return db.query(Reserva).filter(Reserva.id_reserva == reserva_id).first()


def get_reservas(db: Session, skip: int = 0, limit: int = 100) -> list[Reserva]:
    return db.query(Reserva).offset(skip).limit(limit).all()


def get_reservas_por_usuario(db: Session, usuario_id: int) -> list[Reserva]:
    return db.query(Reserva).filter(Reserva.id_usuario == usuario_id).all()


def create_reserva(db: Session, reserva: ReservaCreate) -> Reserva:
    db_reserva = Reserva(**reserva.model_dump())
    db.add(db_reserva)
    db.commit()
    db.refresh(db_reserva)
    return db_reserva


def update_reserva(db: Session, reserva_id: int, reserva: ReservaUpdate) -> Reserva | None:
    db_reserva = get_reserva(db, reserva_id)
    if db_reserva is None:
        return None
    for key, value in reserva.model_dump(exclude_unset=True).items():
        setattr(db_reserva, key, value)
    db.commit()
    db.refresh(db_reserva)
    return db_reserva


def delete_reserva(db: Session, reserva_id: int) -> bool:
    db_reserva = get_reserva(db, reserva_id)
    if db_reserva is None:
        return False
    db.delete(db_reserva)
    db.commit()
    return True
