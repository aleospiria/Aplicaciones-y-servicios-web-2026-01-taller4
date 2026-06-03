# Gestión de Reservas — Despliegue con Docker

Esta rama contiene la configuración para **desplegar** la aplicación completa (backend FastAPI + frontend React + PostgreSQL) usando Docker Compose.

## Prerrequisitos

- **Ubuntu Server** 22.04+: instalar Docker Engine y Compose:
  ```bash
  sudo apt update
  sudo apt install docker.io -y              # Motor Docker
  sudo apt install docker-compose-v2 -y      # Plugin compose (V2)
  ```
- Puerto **3000** abierto (frontend) y opcionalmente **8000** (Swagger API)

## Estructura

```
├── Dockerfile             # Backend (Python + Uvicorn)
├── Dockerfile.frontend    # Frontend (Node build → Nginx)
├── docker-compose.yml     # Orquestación de servicios
├── nginx.conf             # Proxy reverso
├── .env.example           # Template de variables de entorno
├── app/
│   └── seed.py            # Crea admin automáticamente al arrancar
└── frontend/
```

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `DB_PASSWORD` | `reservas123` | Contraseña de PostgreSQL |
| `SECRET_KEY` | `supersecreto-cambiame-en-produccion` | Clave para firmar JWT |
| `ADMIN_EMAIL` | `admin@reservas.com` | Correo del admin que se crea al iniciar |
| `ADMIN_PASSWORD` | `admin123` | Contraseña del admin |
| `ADMIN_NAME` | `Administrador` | Nombre del admin |

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
cp .env.example .env
nano .env
```

> `.env` está en `.gitignore` — **nunca** se sube al repositorio.

## Despliegue rápido

```bash
git clone <url-del-repo> gestion-reservas
cd gestion-reservas
git checkout ops

cp .env.example .env
nano .env

docker compose up -d --build
```

Espera ~10-60s la primera vez (descarga imágenes). Las siguientes son instantáneas.

## Acceso

| Servicio | URL |
|---|---|
| Frontend | `http://<ip-servidor>:3000` |
| Swagger API | `http://<ip-servidor>:8000/docs` |
| Admin por defecto | `admin@reservas.com` / `admin123` |

## Arquitectura

```
Navegador ──► :3000 ──► Nginx
                          ├── /, /assets/       → frontend estático (React build)
                          ├── /auth/*           ──► backend:8000
                          ├── /usuarios/*       ──► backend:8000
                          ├── /espacios/*       ──► backend:8000
                          └── /reservas/*       ──► backend:8000
                                                    └── db:5432 (PostgreSQL)
```

Nginx actúa como **proxy reverso**: recibe todas las peticiones en el puerto 3000, sirve los archivos del frontend directamente y reenvía las llamadas a la API al contenedor del backend. El navegador nunca ve al backend directamente, lo que elimina problemas de CORS.

## Admin automático

Al arrancar el backend, `app/seed.py` verifica si existe un usuario con el correo `ADMIN_EMAIL`. Si no existe, lo crea con rol `admin`. Si ya existe, no hace nada.

Esto ocurre **cada vez que el contenedor del backend se inicia**, no solo la primera vez.

## Comandos útiles

```bash
# Iniciar (construye imágenes si hay cambios)
docker compose up -d --build

# Ver estado de los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Detener sin eliminar (reactivación instantánea)
docker compose stop
docker compose start

# Detener y eliminar contenedores (datos BD se conservan)
docker compose down

# Detener y eliminar TODO, incluyendo datos de la BD
docker compose down -v

# Backup de la base de datos
docker compose exec db pg_dump -U reservas reservas > backup.sql

# Restaurar un backup
cat backup.sql | docker compose exec -T db psql -U reservas reservas
```

## Dockerfiles

### Backend (`Dockerfile`)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
EXPOSE 8000
CMD ["sh", "-c", "python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

- Usa `python:3.12-slim` como base (Debian minimalista con Python 3.12)
- Instala dependencias desde `requirements.txt`
- Copia todo el código del backend
- Al arrancar ejecuta `app.seed` (crea admin si no existe) y luego levanta Uvicorn

### Frontend (`Dockerfile.frontend`)

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN rm -f package-lock.json && npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Construcción en dos etapas:
1. **Builder**: compila el frontend con Node 20 y genera `dist/`
2. **Producción**: solo toma `dist/` y lo sirve con Nginx (~25 MB final)

## `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_DB: reservas
      POSTGRES_USER: reservas
      POSTGRES_PASSWORD: ${DB_PASSWORD:-reservas123}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U reservas -d reservas"]
      interval: 5s
      retries: 5

  backend:
    build: .
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://reservas:${DB_PASSWORD:-reservas123}@db:5432/reservas
      SECRET_KEY: ${SECRET_KEY:-supersecreto-cambiame-en-produccion}
      ADMIN_EMAIL: ${ADMIN_EMAIL:-admin@reservas.com}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD:-admin123}
      ADMIN_NAME: ${ADMIN_NAME:-Administrador}
    ports:
      - "8000:8000"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

Tres servicios que se comunican por la red interna de Docker:
- **`db`**: PostgreSQL 16 Alpine con persistencia en el volumen `pgdata`. Expone su puerto solo en `localhost` del servidor para acceso seguro mediante túnel SSH.
- **`backend`**: FastAPI, construido desde `Dockerfile`. Espera a que `db` esté saludable antes de arrancar.
- **`frontend`**: Nginx con el build de React, construido desde `Dockerfile.frontend`.

## Red y persistencia

- Los contenedores se comunican mediante la **red interna de Docker** usando los nombres de servicio (`db`, `backend`, `frontend`) como DNS.
- PostgreSQL guarda sus datos en el volumen **`pgdata`**, que persiste aunque los contenedores se eliminen.

## Puertos utilizados

| Puerto | Servicio | Acceso |
|---|---|---|
| `3000` | Frontend (Nginx) | Público — interfaz de usuario |
| `8000` | Backend (FastAPI) | Público — Swagger y API directa |
| `5432` | PostgreSQL | **Solo localhost** — acceso mediante túnel SSH |

## Seguridad

1. **Cambia `SECRET_KEY`** en `.env` — es la clave que firma los JWT, si alguien la obtiene puede generar tokens falsos
2. **Cambia `ADMIN_PASSWORD`** en `.env` — el default (`admin123`) no es seguro para producción
3. **Cambia `DB_PASSWORD`** en `.env` — no uses el default en un servidor real
4. PostgreSQL expone su puerto **solo en `127.0.0.1`** del servidor, inaccesible desde la red externa
5. Para HTTPS real, agrega Certbot + Nginx o un reverse proxy como Caddy o Cloudflare Tunnel

## Acceso seguro a la base de datos (túnel SSH)

PostgreSQL solo escucha en `localhost` del servidor. Para conectarte con pgAdmin desde tu PC sin exponer el puerto a la red, usa un **túnel SSH**:

### Desde Windows (PowerShell)

```powershell
ssh -L 5433:localhost:5432 aleospiria@<ip-del-servidor>
```

| Parámetro | Significado |
|---|---|
| `-L 5433:localhost:5432` | Puerto `5433` de tu PC → `localhost:5432` del servidor |
| `aleospiria` | Tu usuario SSH en el servidor |
| `<ip-del-servidor>` | IP del servidor Ubuntu |

Mantén esa terminal abierta. Luego en pgAdmin crea una conexión a:

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `reservas` |
| User | `reservas` |
| Password | El valor de `DB_PASSWORD` del `.env` del servidor |

Al cerrar la terminal SSH, el túnel se corta automáticamente.

## Solución de errores comunes

| Error | Causa | Solución |
|---|---|---|
| `502 Bad Gateway` | Backend no responde | `docker compose logs backend` para ver el error |
| `relation "usuarios" does not exist` | Seed se ejecuta antes de crear tablas | Agregar `Base.metadata.create_all()` al inicio de `seed_admin()` |
| `ModuleNotFoundError: No module named 'asyncpg'` | DATABASE_URL usa driver async | Usar `postgresql://` (sync con psycopg2) en vez de `postgresql+asyncpg://` |
| `npm ci` falla con lock desincronizado | Lock file generado en otro SO | Cambiar a `rm -f package-lock.json && npm install` en el Dockerfile |
| `@rolldown/binding` no encontrado | Binding nativo incompatible con la arquitectura | Usar `node:20-slim` en vez de `node:20-alpine` |
| `Permission denied` al exponer puerto | Puerto local ocupado | Usar otro puerto local (ej. `5433` en vez de `5432`) |
