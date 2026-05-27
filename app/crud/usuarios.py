from sqlalchemy.orm import Session
from app.models import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.auth.security import hash_password


def get_usuario(db: Session, usuario_id: int) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()


def get_usuario_por_correo(db: Session, correo: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.correo == correo).first()


def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Usuario]:
    return db.query(Usuario).offset(skip).limit(limit).all()


def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    db_usuario = Usuario(
        nombre=usuario.nombre,
        correo=usuario.correo,
        contraseña=hash_password(usuario.contraseña),
        rol=usuario.rol,
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def update_usuario(db: Session, usuario_id: int, usuario: UsuarioUpdate) -> Usuario | None:
    db_usuario = get_usuario(db, usuario_id)
    if db_usuario is None:
        return None
    update_data = usuario.model_dump(exclude_unset=True)
    if "contraseña" in update_data:
        update_data["contraseña"] = hash_password(update_data["contraseña"])
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def delete_usuario(db: Session, usuario_id: int) -> bool:
    db_usuario = get_usuario(db, usuario_id)
    if db_usuario is None:
        return False
    db.delete(db_usuario)
    db.commit()
    return True
