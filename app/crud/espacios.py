from sqlalchemy.orm import Session
from app.models import Espacio
from app.schemas.espacio import EspacioCreate, EspacioUpdate


def get_espacio(db: Session, espacio_id: int) -> Espacio | None:
    return db.query(Espacio).filter(Espacio.id_espacio == espacio_id).first()


def get_espacios(db: Session, skip: int = 0, limit: int = 100) -> list[Espacio]:
    return db.query(Espacio).offset(skip).limit(limit).all()


def get_espacios_activos(db: Session) -> list[Espacio]:
    return db.query(Espacio).filter(Espacio.estado == "activo").all()


def create_espacio(db: Session, espacio: EspacioCreate) -> Espacio:
    db_espacio = Espacio(**espacio.model_dump())
    db.add(db_espacio)
    db.commit()
    db.refresh(db_espacio)
    return db_espacio


def update_espacio(db: Session, espacio_id: int, espacio: EspacioUpdate) -> Espacio | None:
    db_espacio = get_espacio(db, espacio_id)
    if db_espacio is None:
        return None
    for key, value in espacio.model_dump(exclude_unset=True).items():
        setattr(db_espacio, key, value)
    db.commit()
    db.refresh(db_espacio)
    return db_espacio


def delete_espacio(db: Session, espacio_id: int) -> bool:
    db_espacio = get_espacio(db, espacio_id)
    if db_espacio is None:
        return False
    db.delete(db_espacio)
    db.commit()
    return True
