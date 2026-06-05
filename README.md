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

Copia el template y ajusta los valores:

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
