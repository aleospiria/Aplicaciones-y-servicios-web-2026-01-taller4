import os
from dotenv import load_dotenv
from app.db import SessionLocal
from app.models import Usuario
from app.auth.security import hash_password

load_dotenv()


def seed_admin():
    email = os.getenv("ADMIN_EMAIL", "admin@reservas.com")
    password = os.getenv("ADMIN_PASSWORD", "admin123")
    name = os.getenv("ADMIN_NAME", "Administrador")

    db = SessionLocal()
    try:
        existing = db.query(Usuario).filter(Usuario.correo == email).first()
        if existing:
            print(f"Admin ya existe: {email}")
            return

        admin = Usuario(
            nombre=name,
            correo=email,
            contraseña=hash_password(password),
            rol="admin",
        )
        db.add(admin)
        db.commit()
        print(f"Admin creado: {email} / {password}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
