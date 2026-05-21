#Laboratorio 4 — Laboratorio Integrador de Aplicaciones y Servicios Web

> **Asignatura:** Aplicaciones y Servicios Web  
> **Programa:** Tecnología en Desarrollo de Software  
> **Laboratorio:** DevOps  
> **Código de guía:** 004  
> **Tiempo estimado:** 20 días  
> **Elaborado por:** Juan Carlos Morales Guerra — v001 · 19-05-2026

---

## Competencias, Contenido e Indicador de Logro

| Competencia | Contenido Temático | Indicador de Logro |
|---|---|---|
| El estudiante desarrolla competencias para diseñar, implementar y desplegar aplicaciones web integrando frontend, backend y bases de datos, aplicando autenticación, control de acceso, consumo de servicios API, control de versiones y herramientas de contenerización para el despliegue de soluciones funcionales en entornos Linux o WSL. | Arquitectura de aplicaciones web · Frontend y backend · Bases de datos relacionales · Diseño e implementación de API REST · Autenticación y autorización con JWT · Roles y permisos de usuario · Reglas de negocio · Control de versiones con Git y GitHub · Trabajo colaborativo mediante ramas · Contenerización con Docker · Orquestación de servicios con Docker Compose · Variables de entorno (`.env`) · Despliegue de aplicaciones en Linux o WSL · Documentación técnica y manuales de usuario mediante README.md | El estudiante desarrolla y despliega una aplicación web funcional integrando frontend, backend y base de datos, aplicando autenticación con JWT, reglas de negocio, control de versiones y despliegue mediante contenedores Docker en entornos Linux o WSL, documentando adecuadamente el proceso de desarrollo, operación y uso del sistema. |

---

## 1. Fundamento Teórico

El desarrollo de aplicaciones web modernas se basa en la integración de diferentes componentes que trabajan de forma coordinada para ofrecer una solución funcional al usuario. En este laboratorio se implementa una arquitectura compuesta por **frontend**, **backend** y **base de datos**, desplegada mediante contenedores.

- **Frontend:** interfaz gráfica con la que interactúa el usuario. Permite iniciar sesión, consultar espacios, crear reservas y revisar el estado de solicitudes.
- **Backend:** componente encargado de procesar solicitudes, aplicar reglas de negocio, validar información y gestionar la comunicación con la base de datos. Expone una API REST.
- **Base de datos:** almacena y organiza de manera persistente usuarios, espacios institucionales y reservas, garantizando consistencia e integridad.
- **REST API:** la comunicación entre frontend y backend se realiza mediante métodos HTTP (GET, POST, PUT, DELETE).
- **JWT (JSON Web Token):** mecanismo de autenticación que valida la identidad del usuario y restringe funcionalidades según el rol asignado.
- **Git / GitHub:** gestión del trabajo colaborativo y control de versiones mediante ramas.
- **Docker y Docker Compose:** herramientas DevOps para contenerizar los componentes del sistema, garantizando ejecución consistente en entornos Linux o Windows con WSL.

---

## 2. Objetivos

### Objetivo General

Desarrollar y desplegar una aplicación web para la gestión de reservas de espacios institucionales, integrando frontend, backend y base de datos, mediante el uso de contenedores Docker en entornos Linux o Windows con WSL.

### Objetivos Específicos

- Diseñar la arquitectura de una aplicación web compuesta por frontend, backend y base de datos.
- Implementar servicios web para la gestión de usuarios, espacios y reservas aplicando reglas de negocio y autenticación mediante JWT.
- Desarrollar una interfaz gráfica que permita la interacción entre usuarios y administradores con el sistema.
- Gestionar el trabajo colaborativo mediante control de versiones utilizando Git y GitHub.
- Desplegar la aplicación utilizando Docker y Docker Compose en un entorno Linux o WSL.
- Documentar el desarrollo, despliegue y uso del sistema mediante archivos `README.md`.

---

## 3. Recursos Requeridos

### Equipos

- Computador personal o estación de trabajo por estudiante.

### Herramientas de Software

| Herramienta | Descripción |
|---|---|
| Sistema operativo | Linux o Windows (con WSL) |
| Python | 3.10 o superior |
| FastAPI | Framework backend |
| PostgreSQL | Base de datos relacional |
| SQLAlchemy | ORM para Python |
| Uvicorn | Servidor ASGI |
| Docker | Contenerización |
| Git | Control de versiones |
| GitHub | Repositorio remoto y colaboración |
| Visual Studio Code | Editor de código recomendado |
| `python-jose[cryptography]` | Manejo de JWT |
| `passlib[bcrypt]` | Hash de contraseñas |
| `python-multipart` | Soporte para formularios |
| `python-dotenv` | Gestión de variables de entorno |

### Material Bibliográfico

- 📁 Repositorio de clase: https://github.com/Juanmorales177809/apps_services.git

---

## 4. Aspectos de Seguridad

Esta práctica corresponde a una actividad de desarrollo de software; no se identifican riesgos físicos o químicos. Se recomienda:

- Mantener una postura adecuada durante el uso prolongado del computador.
- Evitar la manipulación inadecuada de cables o conexiones eléctricas.
- Realizar copias de seguridad periódicas del código para evitar pérdida de información.

---

## 5. Procedimiento y Metodología

La práctica se desarrollará en **equipos de 2 a 3 estudiantes**.

---

### Actividad 1 — Configuración del Repositorio

Cada equipo debe crear un repositorio en GitHub con tres ramas:

#### Rama `dev` — Desarrollo
Debe contener:
- Frontend
- Backend (modelos, endpoints, validaciones, reglas de negocio)
- `README.md` de desarrollo

#### Rama `ops` — Despliegue
Debe contener:
- `Dockerfile` del frontend
- `Dockerfile` del backend
- `docker-compose.yml`
- `.env.example`
- Configuración de base de datos
- `README.md` de despliegue

#### Rama `main` — Versión Final
- Contiene la integración de `dev` y `ops`.
- El `README.md` de `main` será el informe final del proyecto.

---

### Actividad 2 — Comprensión del Problema, Requisitos y Reglas de Negocio

#### Descripción del Problema

Una institución requiere una aplicación web para administrar la reserva de espacios como salas de reuniones, laboratorios, auditorios o aulas especiales. El sistema debe evitar conflictos por horarios cruzados, reservas fuera del horario permitido o solicitudes con poca anticipación.

#### Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| A | Inicio de sesión con autenticación JWT |
| B | Control de acceso según rol: `admin` o `usuario` |
| C | Registrar usuarios |
| D | Consultar usuarios registrados |
| E | Registrar espacios institucionales |
| F | Consultar espacios disponibles |
| G | Crear reservas |
| H | Consultar reservas realizadas |
| I | Actualizar el estado de una reserva |
| J | Cancelar una reserva |
| K | Validar disponibilidad antes de crear una reserva |
| L | Mostrar mensajes de error cuando una reserva no cumpla las reglas de negocio |

#### Modelo Básico de Datos

**Tabla `usuarios`**

| Campo | Tipo |
|---|---|
| id_usuario | PK |
| nombre | texto |
| correo | texto |
| rol | texto (`admin` / `usuario`) |

**Tabla `espacios`**

| Campo | Tipo |
|---|---|
| id_espacio | PK |
| nombre | texto |
| ubicacion | texto |
| capacidad | entero |
| estado | texto |

**Tabla `reservas`**

| Campo | Tipo |
|---|---|
| id_reserva | PK |
| id_usuario | FK → usuarios |
| id_espacio | FK → espacios |
| fecha | fecha |
| hora_inicio | hora |
| hora_fin | hora |
| cantidad_asistentes | entero |
| estado | texto |

#### Reglas de Negocio

| ID | Regla |
|----|-------|
| A | Solo un usuario autenticado puede crear reservas |
| B | Solo un usuario `admin` puede aprobar o rechazar reservas |
| C | **No permitir reservas superpuestas:** no se puede reservar un espacio si ya existe una reserva en el mismo horario y fecha |
| D | **Mínimo 24 horas de anticipación:** toda reserva debe realizarse con al menos 24 horas de anticipación |
| E | **Horario permitido:** Lunes–Viernes 7:00 a.m.–8:00 p.m. · Sábados 8:00 a.m.–12:00 m. · Domingos: no se permiten reservas |
| F | **Hora inicio < hora fin:** el sistema no acepta reservas con hora inicio igual o posterior a hora fin |
| G | **No reservar espacios inactivos:** estado `inactivo`, `en mantenimiento` o `no disponible` bloquea la reserva |
| H | **Capacidad máxima:** la cantidad de asistentes no puede superar la capacidad del espacio |
| I | **Estado inicial `esperando`:** solo un `admin` puede cambiar el estado a `aprobada` o `rechazada`. Las reservas `esperando` y `aprobada` bloquean el horario; las `rechazadas` no |

---

### Actividad 3 — Desarrollo del Backend

El backend se desarrollará con **FastAPI** siguiendo una arquitectura modular.

#### El backend debe incluir:
- Conexión a base de datos
- Modelos o entidades principales
- Endpoints para usuarios, espacios y reservas
- Autenticación mediante JWT (roles: `admin` / `usuario`)
- Autorización por roles
- Validaciones de reglas de negocio
- Manejo básico de errores
- Documentación automática de la API (Swagger)

#### Estructura sugerida de carpetas

```
app/
├── api/
│   ├── usuarios.py
│   ├── espacios.py
│   ├── reservas.py
│   └── auth.py
├── models/
│   ├── usuario.py
│   ├── espacio.py
│   └── reserva.py
├── schemas/
│   ├── usuario.py
│   ├── espacio.py
│   └── reserva.py
├── crud/
├── auth/
├── db.py
└── main.py
```

> ⚠️ El uso de arquitectura estructurada en carpetas es **obligatorio**.

#### Consideraciones de seguridad
- Las contraseñas **no deben almacenarse en texto plano**. Usar `passlib`, `bcrypt` o `pwdlib`.
- Los endpoints deben retornar respuestas estructuradas con mensajes claros de éxito o error.

**Ejemplos de respuestas esperadas:**
- Creación exitosa
- Error de autenticación
- Reserva rechazada por conflicto de horario
- Reserva creada en estado `esperando`

---

### Actividad 4 — Desarrollo del Frontend

La tecnología de desarrollo del frontend es de **libre elección** del equipo, siempre que permita el consumo correcto de la API.

**Opciones permitidas (ejemplos):**
- HTML, CSS y JavaScript puro
- React
- Vue
- Angular
- Templates del backend
- Otros frameworks o librerías

#### El frontend debe incluir como mínimo:
- Pantalla de inicio de sesión
- Gestión de autenticación con JWT
- Interfaz diferenciada por rol

**Usuario:**
- Consultar espacios
- Crear reservas
- Consultar sus reservas

**Administrador:**
- Gestionar espacios
- Consultar todas las reservas
- Aprobar o rechazar reservas

#### Otras consideraciones:
- Gestión básica de formularios (validación en cliente)
- Manejo de mensajes de éxito y error
- Almacenamiento del token JWT: libre elección (`localStorage`, `sessionStorage`, `cookies`, etc.)
- El backend es el responsable final de validar reglas de negocio e integridad de datos

---

### Actividad 5 — Despliegue en Contenedores Docker

El sistema completo debe desplegarse en **Linux o WSL** usando Docker y Docker Compose.

#### El sistema debe levantar al menos:
- Contenedor del frontend (expuesto en puerto local)
- Contenedor del backend
- Contenedor de la base de datos

#### El archivo `docker-compose.yml` debe incluir:
- Servicio del frontend
- Servicio del backend
- Servicio de base de datos
- Red entre contenedores
- Volúmenes para persistencia de datos
- Variables de entorno necesarias

> 📌 Consultar el repositorio de clase para ejemplos de configuración.

---

## 6. Parámetros para Elaboración del Informe (README.md)

Cada equipo entregará la documentación mediante archivos `README.md` en las tres ramas del repositorio.

### `README.md` — Rama `main` (Manual de usuario e informe final)

Debe incluir:
- Nombre de la aplicación, descripción general y objetivo
- Integrantes del equipo y rol de cada uno
- Qué hace la aplicación y qué problema resuelve
- Arquitectura general y tecnologías utilizadas
- Resumen del despliegue (Docker Compose, Linux/WSL, puertos, referencia a rama `ops`)
- Tutorial de uso con imágenes (inicio de sesión, creación/consulta/cancelación de reservas, gestión de espacios, mensajes de error, cierre de sesión)
- Conclusiones, dificultades, aprendizajes y mejoras futuras

### `README.md` — Rama `dev` (Documentación técnica)

Debe incluir:
- Arquitectura del frontend y backend
- Diseño de base de datos y modelo entidad-relación
- Estructura de carpetas, tecnologías y librerías
- Endpoints desarrollados
- Modelo de autenticación JWT y roles implementados
- Reglas de negocio implementadas y proceso de validación de reservas
- Instrucciones para ejecutar en modo desarrollo

### `README.md` — Rama `ops` (Documentación de despliegue)

Debe incluir:
- Requisitos previos (Docker, Docker Compose, WSL si aplica)
- Clonación del repositorio y configuración de `.env`
- Explicación de variables de entorno
- `Dockerfile` del frontend y backend
- Archivo `docker-compose.yml`
- Configuración de red y persistencia
- Puertos utilizados
- Construcción, ejecución y verificación del sistema
- Apagado, reinicio y actualización
- Solución de errores comunes

> 📝 El README debe permitir que cualquier persona pueda ejecutar el proyecto **sin necesidad de información adicional**.

---

## 7. Entregables y Resultados Esperados

### A. Repositorio del Proyecto
- Repositorio en GitHub con ramas `main`, `dev`, `ops`
- Código fuente del frontend y backend
- Configuración de base de datos, Dockerfiles y `docker-compose.yml`
- **Cada integrante debe tener commits verificables en el historial**

### B. Documentación del Proyecto
- `README.md` en `main` — manual de usuario e informe final
- `README.md` en `dev` — documentación técnica
- `README.md` en `ops` — documentación de despliegue

### C. Despliegue Funcional
El sistema debe demostrar:
- Frontend accesible desde el navegador
- Backend funcionando correctamente
- Base de datos operativa
- Comunicación entre contenedores
- Autenticación JWT funcional
- Reglas de negocio operativas

### D. Sustentación del Proyecto
- Programada mediante cita con el docente
- Verifica: funcionamiento del sistema, comprensión técnica, participación individual, arquitectura y proceso de despliegue

> ⚠️ **Importante:** únicamente los proyectos sustentados podrán ser considerados para calificación.

---

## 8. Criterios de Evaluación

| Criterio | Descripción | Porcentaje |
|---|---|:---:|
| **Desarrollo (Dev)** | Implementación del frontend, backend, base de datos, autenticación JWT, roles, validaciones y reglas de negocio | 20% |
| **Despliegue (Ops)** | Dockerfiles, Docker Compose, despliegue funcional en Linux/WSL, conectividad entre servicios y ejecución correcta | 10% |
| **Documentación** | Calidad y completitud de los README.md (main, dev, ops), claridad técnica, manual de usuario y reproducibilidad | 20% |
| **Sustentación** | Funcionamiento en vivo, dominio técnico, explicación de arquitectura, despliegue y participación de los integrantes | 50% |

**Consideraciones:**
- El sistema debe encontrarse **funcional** al momento de la sustentación.
- Se verificará la participación individual mediante el historial de commits.
- La documentación debe permitir reproducir el sistema siguiendo los README.md.

---

## 9. Bibliografía

1. Docker, Inc. (2024). *Docker documentation*. https://docs.docker.com
2. Docker, Inc. (2024). *Docker Compose overview*. https://docs.docker.com/compose
3. Bayer, M. (2024). *SQLAlchemy documentation (version 2.0)*. SQLAlchemy Project. https://docs.sqlalchemy.org
4. Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)* (RFC 7519). Internet Engineering Task Force (IETF). https://doi.org/10.17487/RFC7519
5. Hardt, D. (Ed.). (2012). *The OAuth 2.0 authorization framework* (RFC 6749). Internet Engineering Task Force (IETF). https://doi.org/10.17487/RFC6749
6. FastAPI. (2024). *FastAPI documentation*. https://fastapi.tiangolo.com
7. Pydantic. (2024). *Pydantic documentation*. https://docs.pydantic.dev
8. Python Software Foundation. (2024). *Python documentation*. https://docs.python.org
9. Chacon, S., & Straub, B. (2014). *Pro Git*. Apress.
10. Fielding, R. (2000). *Architectural styles and the design of network-based software architectures*. University of California, Irvine.

---

*Guía FGL-029 · Versión 001 · 19-05-2026 · Elaborada por Juan Carlos Morales Guerra*
