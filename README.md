# Gestión de Reservas de Espacios Institucionales

## Descripción

Aplicación web para la gestión de reservas de espacios institucionales (salas de reuniones, laboratorios, auditorios, aulas especiales). Desarrollada con FastAPI + PostgreSQL como parte del Laboratorio 4 de Aplicaciones y Servicios Web.

---

## Organización del Proyecto

El desarrollo se gestiona mediante **Issues** y **Milestones** en GitHub.

### Milestones

| Milestone | Descripción | Issues |
|---|---|---|
| **Backend** | Toda la lógica del servidor: API REST, autenticación JWT, reglas de negocio | #3 al #12 |
| **Frontend** | Interfaz gráfica: login, CRUD espacios, gestión de reservas | #13 al #15 |
| **Config/Doc** | Docker, despliegue, READMEs | #16 al #18 |

### Issues completados

| Issue | Descripción | Estado |
|---|---|---|
| #1 | Estructura de carpetas del backend | ✅ Cerrado |
| #2 | READMEs y documentación inicial | ✅ Cerrado |
| #3 | Configurar conexión a base de datos | ✅ Cerrado |
| #4 | Crear modelos ORM | ✅ Cerrado |
| #5 | Crear esquemas Pydantic | 🔄 En progreso |

---

## Tecnologías

| Herramienta | Versión | Propósito |
|---|---|---|
| Python | 3.11 | Lenguaje base |
| FastAPI | 0.136.3 | Framework web ASGI |
| SQLAlchemy | 2.0.50 | ORM para base de datos |
| PostgreSQL | 17 | Base de datos relacional |
| Uvicorn | 0.48.0 | Servidor ASGI |
| python-jose | 3.5.0 | JWT (autenticación) |
| passlib | 1.7.4 | Hash de contraseñas (bcrypt) |
| python-dotenv | 1.2.2 | Variables de entorno |
| python-multipart | 0.0.29 | Soporte para formularios |
| Pydantic | 2.13.4 | Validación de datos |

---

## Estructura del Proyecto

```
app/
├── api/               # Endpoints (routers)
│   ├── __init__.py
│   ├── auth.py        # Login / registro
│   ├── usuarios.py    # CRUD usuarios
│   ├── espacios.py    # CRUD espacios
│   └── reservas.py    # CRUD reservas + reglas de negocio
├── models/            # Modelos ORM
│   ├── __init__.py
│   ├── usuario.py     # Usuario (id, nombre, correo, contraseña, rol)
│   ├── espacio.py     # Espacio (id, nombre, ubicacion, capacidad, estado)
│   └── reserva.py     # Reserva (id, FK usuario/espacio, fecha, hora, asistentes, estado)
├── schemas/           # Esquemas Pydantic
│   ├── __init__.py
│   ├── usuario.py     # UsuarioCreate, UsuarioOut
│   ├── espacio.py     # EspacioCreate, EspacioOut
│   └── reserva.py     # ReservaCreate, ReservaOut
├── crud/              # Operaciones CRUD
│   ├── __init__.py
│   ├── usuarios.py
│   ├── espacios.py
│   └── reservas.py
├── auth/              # Autenticación y seguridad
│   ├── __init__.py
│   ├── jwt.py         # Crear y validar tokens JWT
│   └── security.py    # Hash contraseñas, dependencias
├── db.py              # Conexión a PostgreSQL (engine, SessionLocal, Base, get_db)
└── main.py            # Punto de entrada FastAPI
```

---

## Configuración del Entorno de Desarrollo

### 1. Base de datos PostgreSQL

Se utilizó PostgreSQL 17 instalado localmente con pgAdmin para gestión visual.

**Configuración:**
- Host: `localhost:5432`
- Base de datos: `reservas_db`
- Usuario: `postgres`

**.env.example:**
el archivo **.env** que usaremos es el siguiente mientras se desarrolla todo (de forma local) antes de desplegarlo, luego debemos poner totalmente secreto mediante el .env la URL.
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/reservas_db
```

### 2. Conexión desde Python (`app/db.py`)

```python
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/reservas_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3. Modelos ORM (`app/models/`)

Tres modelos que reflejan el modelo de datos del laboratorio:

**Usuario**
| Campo | Tipo | Detalle |
|---|---|---|
| id_usuario | Integer | PK, autoincremental |
| nombre | String(100) | No nulo |
| correo | String(100) | Único, no nulo |
| contraseña | String(255) | Hash con bcrypt |
| rol | String(20) | `admin` o `usuario` (default `usuario`) |

**Espacio**
| Campo | Tipo | Detalle |
|---|---|---|
| id_espacio | Integer | PK, autoincremental |
| nombre | String(100) | No nulo |
| ubicacion | String(200) | No nulo |
| capacidad | Integer | No nulo |
| estado | String(50) | `activo`, `inactivo`, `mantenimiento` (default `activo`) |

**Reserva**
| Campo | Tipo | Detalle |
|---|---|---|
| id_reserva | Integer | PK, autoincremental |
| id_usuario | Integer | FK → Usuario |
| id_espacio | Integer | FK → Espacio |
| fecha | Date | No nulo |
| hora_inicio | Time | No nulo |
| hora_fin | Time | No nulo |
| cantidad_asistentes | Integer | No nulo |
| estado | String(20) | `esperando`, `aprobada`, `rechazada` (default `esperando`) |

---

## Cómo ejecutar en modo desarrollo

```bash
# 1. Activar entorno virtual
.\venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Asegurar PostgreSQL corriendo con la BD reservas_db creada

# 4. Iniciar servidor
uvicorn app.main:app --reload
```

La documentación automática de la API estará disponible en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---