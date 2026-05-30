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
| #1–#12 | Backend completo (FastAPI + PostgreSQL) | ✅ Cerrado |
| #13 | Frontend: Login y autenticación | 🔄 Pendiente |
| #14 | Frontend: Vistas de usuario | 🔄 Pendiente |
| #15 | Frontend: Vistas de administrador | 🔄 Pendiente |

### Issues en progreso (Frontend 🔄)

| Issue | Descripción | Estado |
|---|---|---|---|
| #1 | Estructura de carpetas del backend | ✅ Cerrado |
| #2 | READMEs y documentación inicial | ✅ Cerrado |
| #3 | Configurar conexión a base de datos | ✅ Cerrado |
| #4 | Crear modelos ORM | ✅ Cerrado |
| #5 | Crear esquemas Pydantic | ✅ Cerrado |
| #6 | Autenticación JWT (security, jwt, roles) | ✅ Cerrado |
| #8 | CRUD de usuarios, espacios y reservas | ✅ Cerrado |
| #7 | Endpoint de autenticación | ✅ Cerrado |
| #9 | Endpoints de usuarios | ✅ Cerrado |
| #10 | Endpoints de espacios | ✅ Cerrado |
| #11 | Endpoints de reservas + reglas de negocio | ✅ Cerrado |
| #12 | Punto de entrada y configuración (main.py) | ✅ Cerrado |

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
│   ├── auth.py        # POST /register, POST /login
│   ├── usuarios.py    # CRUD usuarios (solo admin)
│   ├── espacios.py    # GET público, POST/PUT/DELETE solo admin
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
│   ├── reserva.py     # ReservaCreate, ReservaOut
│   └── auth.py        # LoginRequest, TokenResponse
├── crud/              # Operaciones CRUD
│   ├── __init__.py
│   ├── usuarios.py    # CRUD Usuario (get, create, update, delete)
│   ├── espacios.py    # CRUD Espacio (get, create, update, delete)
│   └── reservas.py    # CRUD Reserva (get, create, update, delete)
├── auth/              # Autenticación, autorización y seguridad
│   ├── __init__.py
│   ├── security.py    # hash_password(), verify_password() con bcrypt
│   ├── jwt.py         # create_access_token(), get_current_user()
│   └── roles.py       # admin_required(), usuario_required()
├── db.py              # Conexión a PostgreSQL (engine, SessionLocal, Base, get_db)
├── main.py            # Punto de entrada FastAPI
frontend/
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── services/      # Llamadas a la API
│   ├── App.jsx        # Router principal
│   └── main.jsx       # Punto de entrada React
├── package.json
└── vite.config.js     # Proxy al backend
```

---

## Configuración del Entorno de Desarrollo

### 1. Base de datos PostgreSQL

Se utilizó PostgreSQL 17 instalado localmente con pgAdmin para gestión visual.

**Configuración:**
- Host: `localhost:5432`
- Base de datos: `reservas_db`
- Usuario: `postgres`

**.env:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/reservas_db
SECRET_KEY=dev-secret-key-change-in-production
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

### 4. Autenticación y autorización (`app/auth/`)

Tres archivos que gestionan la seguridad del sistema:

**`security.py`** — Hash de contraseñas con bcrypt:
- `hash_password("pass")` → retorna el hash
- `verify_password("pass", "hash")` → retorna True/False

**`jwt.py`** — Tokens JWT:
- `create_access_token({"sub": id, "rol": "admin"})` → genera un token firmado con `SECRET_KEY`, expira en 60 min
- `get_current_user` → extrae el token del header `Authorization: Bearer <token>`, lo decodifica y retorna el usuario autenticado

**`roles.py`** — Control de acceso por rol:
- `admin_required` → solo permite `admin`
- `usuario_required` → permite `admin` y `usuario`

Uso en endpoints:
```python
@app.get("/espacios")
def listar_espacios(admin: Usuario = Depends(admin_required)):
    ...
```

### 5. Operaciones CRUD (`app/crud/`)

Cada entidad tiene su archivo con operaciones estándar:

| Archivo | Funciones |
|---|---|
| `usuarios.py` | `get_usuario`, `get_usuarios`, `get_usuario_por_correo`, `create_usuario` (hashea contraseña automáticamente), `update_usuario`, `delete_usuario` |
| `espacios.py` | `get_espacio`, `get_espacios`, `get_espacios_activos`, `create_espacio`, `update_espacio`, `delete_espacio` |
| `reservas.py` | `get_reserva`, `get_reservas`, `get_reservas_por_usuario`, `create_reserva`, `update_reserva`, `delete_reserva` |

Todas reciben `db: Session` y retornan el modelo o `None` si no existe.

### 6. API Endpoints

| Archivo | Endpoint | Método | Acceso | Descripción |
|---|---|---|---|---|
| `auth.py` | `/auth/register` | POST | Público | Registrar nuevo usuario |
| | `/auth/login` | POST | Público | Iniciar sesión, retorna JWT |
| `usuarios.py` | `/usuarios/` | GET | Admin | Listar usuarios |
| | `/usuarios/{id}` | GET | Admin | Obtener usuario |
| | `/usuarios/` | POST | Admin | Crear usuario |
| | `/usuarios/{id}` | PUT | Admin | Actualizar usuario |
| | `/usuarios/{id}` | DELETE | Admin | Eliminar usuario |
| `espacios.py` | `/espacios/` | GET | Autenticado | Listar espacios |
| | `/espacios/{id}` | GET | Autenticado | Obtener espacio |
| | `/espacios/` | POST | Admin | Crear espacio |
| | `/espacios/{id}` | PUT | Admin | Actualizar espacio |
| | `/espacios/{id}` | DELETE | Admin | Eliminar espacio |
| `reservas.py` | `/reservas/` | GET | Autenticado | Admin ve todas, usuario ve las suyas |
| | `/reservas/{id}` | GET | Autenticado | Ver reserva (usuario solo la suya) |
| | `/reservas/` | POST | Autenticado | Crear reserva (con reglas de negocio) |
| | `/reservas/{id}/estado` | PUT | Admin | Aprobar o rechazar reserva |
| | `/reservas/{id}` | DELETE | Autenticado | Cancelar reserva |

### 7. Punto de entrada (`app/main.py`)

El archivo `main.py` arranca la aplicación FastAPI y configura:

- **Creación automática de tablas:** `Base.metadata.create_all(bind=engine)` crea las tablas en PostgreSQL si no existen al iniciar
- **CORS:** Middleware que permite peticiones desde cualquier origen (`*`) para que el frontend pueda consumir la API sin importar desde dónde se sirva
- **Routers:** Se incluyen los 4 módulos de endpoints:
  - `auth.router` → `/auth/*`
  - `usuarios.router` → `/usuarios/*`
  - `espacios.router` → `/espacios/*`
  - `reservas.router` → `/reservas/*`

Inicio del servidor:
```bash
uvicorn app.main:app --reload
```

Documentación automática disponible en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 8. Frontend — React + Vite

El frontend se desarrolla con **React 19 + Vite**, dentro de la carpeta `frontend/`.

**Tecnologías:**
| Herramienta | Propósito |
|---|---|
| React | Framework de componentes UI |
| Vite | Bundler y servidor de desarrollo |
| React Router DOM | Navegación entre pantallas |
| CSS puro | Estilos (sin framework adicional) |

**Integración con el backend:**
- En desarrollo, Vite tiene un proxy configurado (`vite.config.js`) que redirige peticiones `/auth/*`, `/usuarios/*`, `/espacios/*` y `/reservas/*` al backend en `http://localhost:8000`
- Esto evita problemas de CORS al correr frontend y backend en puertos distintos
- En producción (Docker Compose), ambos servicios se comunican mediante la red interna de Docker

**Estructura del frontend:**
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables (Navbar, ProtectedRoute, etc.)
│   ├── pages/          # Páginas (Login, Espacios, MisReservas, Admin, etc.)
│   ├── services/       # Llamadas a la API (authService, api.js)
│   ├── App.jsx         # Router principal
│   └── main.jsx        # Punto de entrada
├── package.json
└── vite.config.js      # Configuración con proxy al backend
```

### 9. Reglas de negocio implementadas

Validadas al crear o modificar reservas en `api/reservas.py`:

| ID | Regla | Validación |
|---|---|---|
| A | Solo autenticados pueden crear reservas | `usuario_required` en POST |
| B | Solo admin puede aprobar/rechazar | `admin_required` en PUT /estado |
| C | Sin reservas superpuestas | Query SQL: mismo espacio, fecha y horarios se cruzan; solo `esperando`/`aprobada` bloquean |
| D | Mínimo 24h de anticipación | `fecha + hora_inicio >= now + 24h` |
| E | Horario permitido | L-V 7:00–20:00, Sáb 8:00–12:00, Dom prohibido |
| F | Hora inicio < hora fin | Comparación directa |
| G | No espacios inactivos | Estado debe ser `activo` |
| H | Capacidad máxima | `asistentes <= espacio.capacidad` |
| I | Estado inicial `esperando` | Solo admin cambia a `aprobada`/`rechazada` |

---

## Cómo ejecutar en modo desarrollo

### Backend

```bash
# 1. Activar entorno virtual
.\venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Asegurar PostgreSQL corriendo con la BD reservas_db creada

# 4. Iniciar servidor
uvicorn app.main:app --reload
```

Documentación automática: `http://localhost:8000/docs`

### Frontend

```bash
# 1. Entrar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Frontend disponible en: `http://localhost:5173`

> El proxy de Vite redirige automáticamente las llamadas a la API al backend (puerto 8000), por lo que no hay conflictos de CORS en desarrollo.

---