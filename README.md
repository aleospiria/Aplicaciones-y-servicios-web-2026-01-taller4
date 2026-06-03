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
| #13 | Frontend: Login y autenticación | ✅ Cerrado |
| #14 | Frontend: Vistas de usuario (Espacios, Crear Reserva, Mis Reservas) | ✅ Cerrado |
| #15 | Frontend: Vistas de administrador (GestionarEspacios, TodasReservas, AprobarReservas) | ✅ Cerrado |

---

## Tecnologías

| Herramienta | Versión | Propósito |
|---|---|---|
| Python | 3.11 | Lenguaje base (backend) |
| FastAPI | 0.136.3 | Framework web ASGI |
| SQLAlchemy | 2.0.50 | ORM para base de datos |
| PostgreSQL | 17 | Base de datos relacional |
| Uvicorn | 0.48.0 | Servidor ASGI |
| python-jose | 3.5.0 | JWT (autenticación) |
| passlib | 1.7.4 | Hash de contraseñas (bcrypt) |
| python-dotenv | 1.2.2 | Variables de entorno |
| bcrypt | 4.1.3 | Algoritmo de hash (pinned) |
| React | 19 | Frontend — componentes UI |
| Vite | 8 | Bundler y dev server |
| TypeScript | 5.8 | Tipado estático |
| React Router DOM | 7 | Navegación SPA |

---

## Estructura del Proyecto

```
app/
├── api/                  # Endpoints (routers)
│   ├── __init__.py
│   ├── auth.py           # POST /register, POST /login
│   ├── usuarios.py       # CRUD usuarios (solo admin)
│   ├── espacios.py       # GET autenticado, POST/PUT/DELETE solo admin
│   └── reservas.py       # CRUD reservas + reglas de negocio (C–I)
├── models/               # Modelos ORM
│   ├── __init__.py
│   ├── usuario.py        # id, nombre, correo, contraseña, rol
│   ├── espacio.py        # id, nombre, ubicacion, capacidad, estado
│   └── reserva.py        # id, FKs, fecha, hora_inicio, hora_fin, asistentes, estado
├── schemas/              # Esquemas Pydantic
│   ├── __init__.py
│   ├── usuario.py
│   ├── espacio.py
│   ├── reserva.py
│   └── auth.py           # LoginRequest, TokenResponse
├── crud/                 # Operaciones CRUD
│   ├── __init__.py
│   ├── usuarios.py
│   ├── espacios.py
│   └── reservas.py
├── auth/                 # Autenticación y autorización
│   ├── __init__.py
│   ├── security.py       # hash/verify con bcrypt
│   ├── jwt.py            # create_access_token, get_current_user
│   └── roles.py          # admin_required, usuario_required
├── db.py                 # Engine, SessionLocal, Base, get_db
├── main.py               # FastAPI app + CORS + routers
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx        # Navegación con tabs + logout
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Login.tsx         # Inicio de sesión
│   │   ├── Register.tsx      # Registro
│   │   ├── Espacios.tsx      # Bento-grid de espacios
│   │   ├── CrearReserva.tsx  # Formulario de reserva
│   │   └── MisReservas.tsx   # Reservas del usuario
│   ├── services/
│   │   └── api.ts            # Cliente HTTP con JWT
│   ├── App.tsx               # Router
│   ├── main.tsx              # Entry point
│   └── index.css             # Bento Box design system
├── package.json
└── vite.config.ts            # Proxy al backend
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
- `create_access_token({"sub": id, "rol": "admin"})` → genera un token firmado con `SECRET_KEY`, expira en 60 min; convierte `sub` a string automáticamente (compatibilidad con `python-jose` 3.5.0)
- `get_current_user` → extrae el token del header `Authorization: Bearer <token>`, lo decodifica, convierte `sub` a `int` y retorna el usuario autenticado

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

El frontend se desarrolla con **React 19 + Vite + TypeScript**, dentro de la carpeta `frontend/`.

**Tecnologías:**
| Herramienta | Versión | Propósito |
|---|---|---|
| React | 19 | Framework de componentes UI |
| Vite | 8 | Bundler y servidor de desarrollo |
| React Router DOM | 7 | Navegación entre pantallas |
| TypeScript | 5.8 | Tipado estático |
| CSS puro | — | Estilos (sin framework adicional) |

**Integración con el backend:**
- En desarrollo, Vite tiene un proxy configurado (`vite.config.ts`) que redirige peticiones `/auth/*`, `/usuarios/*`, `/espacios/*` y `/reservas/*` al backend en `http://localhost:8000`
- Esto evita problemas de CORS al correr frontend y backend en puertos distintos
- En producción (Docker Compose), ambos servicios se comunican mediante la red interna de Docker

**Estructura del frontend:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Barra de navegación con tabs y logout
│   │   └── ProtectedRoute.tsx   # Redirige a /login si no hay token
│   ├── pages/
│   │   ├── Login.tsx            # Inicio de sesión (decode JWT, guarda rol)
│   │   ├── Register.tsx         # Registro de nuevo usuario
│   │   ├── Espacios.tsx         # Bento-grid de espacios disponibles
│   │   ├── CrearReserva.tsx     # Formulario de nueva reserva
│   │   └── MisReservas.tsx      # Listado de reservas del usuario
│   ├── services/
│   │   └── api.ts               # Cliente HTTP con JWT automático
│   ├── App.tsx                  # Router principal
│   ├── main.tsx                 # Punto de entrada React
│   └── index.css                # Estilos globales (Bento Box design)
├── public/
├── package.json
├── vite.config.ts               # Proxy al backend en :8000
└── tsconfig.json
```

**Flujo de autenticación:**
1. El usuario inicia sesión → el backend devuelve un JWT con `sub` (id) y `rol`
2. El frontend decodifica el payload del JWT y guarda `token` y `rol` en `localStorage`
3. Cada petición a la API incluye el header `Authorization: Bearer <token>`
4. `ProtectedRoute` verifica que exista el token antes de renderizar cualquier página protegida
5. `Navbar` lee el rol de `localStorage` para condicionar los tabs visibles

**Diseño: Bento Box Grid**
- **Paleta:** Superficies `#0F172A` (navbar y cards), Azul `#1D4ED8` (botones/accent), Fondo `#020617`, Texto `#F1F5F9`
- **Layout:** Grid asimétrico de tarjetas (`bento-card`) con sombras suaves y hover elevado
- **Componentes:** `badge` para estados (warning/success/error), `form-card` para formularios, `reserva-card` para listado
- **Responsive:** Adaptación a móvil con media queries (navbar colapsable, grid 1 columna)

**Páginas de usuario:**

| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | `Login.tsx` | Formulario de inicio de sesión |
| `/register` | `Register.tsx` | Formulario de registro |
| `/espacios` | `Espacios.tsx` | Bento-grid de espacios disponibles con botón "Reservar" |
| `/crear-reserva` | `CrearReserva.tsx` | Formulario: espacio, fecha, hora inicio/fin, asistentes |
| `/mis-reservas` | `MisReservas.tsx` | Listado de reservas con badges de estado + cancelación |

**Páginas de administrador:**

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin/gestionar-espacios` | `GestionarEspacios.tsx` | CRUD completo: tabla de espacios + formulario inline |
| `/admin/todas-reservas` | `TodasReservas.tsx` | Tabla completa de todas las reservas del sistema |
| `/admin/aprobar-reservas` | `AprobarReservas.tsx` | Tarjetas de aprobación + historial en tabla |

> La navegación entre vistas de usuario y administrador es automática: el `Navbar` cambia sus tabs según el `rol` almacenado en `localStorage` al iniciar sesión.

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

## Bugs encontrados y soluciones

### 1. bcrypt 5.x incompatible con passlib

| Ítem | Detalle |
|---|---|
| **Síntoma** | `(trapped) error reading bcrypt version` al iniciar el servidor, falla el hash de contraseñas |
| **Causa** | `passlib==1.7.4` no es compatible con `bcrypt>=5.0`; la API interna de bcrypt cambió (`__about__` eliminado) |
| **Solución** | Pinear `bcrypt==4.1.3` en `requirements.txt` como dependencia directa |
| **Commit** | `0c05bd7` |
| **Archivo** | `requirements.txt` |

### 2. python-jose exige `sub` como string

| Ítem | Detalle |
|---|---|
| **Síntoma** | `POST /auth/login` retorna 200 con token, pero cualquier endpoint protegido devuelve `401 Token inválido o expirado` |
| **Causa** | `python-jose==3.5.0` valida que el claim `sub` sea estrictamente `string`; el backend pasaba `id_usuario` (int). El error real (`JWTClaimsError: Subject must be a string`) era capturado como `JWTError` genérico |
| **Solución** | En `create_access_token()` convertir `sub` a string antes de firmar; en `get_current_user()` convertir `sub` de vuelta a `int` para la consulta SQL |
| **Commit** | `9e94a85` |
| **Archivo** | `app/auth/jwt.py` |

### 3. Schema ReservaCreate exigía `id_usuario` en el body

| Ítem | Detalle |
|---|---|
| **Síntoma** | `POST /reservas/` retorna `422 Field required` por `id_usuario` |
| **Causa** | El endpoint asigna `reserva_data.id_usuario = current_user.id_usuario`, pero Pydantic validaba `id_usuario` como campo obligatorio antes de que el endpoint pudiera modificarlo |
| **Solución** | Hacer `id_usuario: int \| None = None` en `ReservaCreate`, permitiendo que el frontend omita el campo |
| **Commit** | `860ddc8` |
| **Archivo** | `app/schemas/reserva.py` |

### 4. Timezone bug al mostrar fechas en el frontend

| Ítem | Detalle |
|---|---|
| **Síntoma** | Al seleccionar una fecha (ej. 4 de junio), la UI muestra el día anterior (3 de junio) |
| **Causa** | `new Date("2026-06-04").toLocaleDateString("es-CO")` interpreta el string ISO como UTC medianoche y lo convierte a UTC-5 (Colombia), desplazando un día atrás |
| **Solución** | Reemplazar por `formatDate(fecha)` que parsea el string ISO directamente sin conversión de zona horaria: `const [y, m, d] = dateStr.split("-"); return \`${d}/${m}/${y}\`` |
| **Commits** | `e832347` |
| **Archivos** | `MisReservas.tsx`, `TodasReservas.tsx`, `AprobarReservas.tsx` |

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