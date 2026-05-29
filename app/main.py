from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.api import auth, usuarios, espacios, reservas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestión de Reservas", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(espacios.router)
app.include_router(reservas.router)


@app.get("/")
def root():
    return {"message": "API de Gestión de Reservas - Taller 4"}
