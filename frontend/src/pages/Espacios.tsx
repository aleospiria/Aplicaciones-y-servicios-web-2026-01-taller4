import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

interface Espacio {
  id_espacio: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: string;
}

function Espacios() {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getEspacios()
      .then((data) => {
        setEspacios(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-container"><Navbar /><p className="loading">Cargando espacios...</p></div>;

  const activos = espacios.filter((e) => e.estado === "activo");

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1>Espacios disponibles</h1>
          <p className="subtitle">{activos.length} espacios disponibles para reservar</p>
        </div>

        {error && <p className="error">{error}</p>}

        {activos.length === 0 && !error && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <p>No hay espacios disponibles en este momento</p>
          </div>
        )}

        <div className="bento-grid">
          {activos.map((espacio) => (
            <div key={espacio.id_espacio} className="bento-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <span className="card-badge">Disponible</span>
              </div>
              <h3>{espacio.nombre}</h3>
              <div className="card-details">
                <div className="card-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{espacio.ubicacion}</span>
                </div>
                <div className="card-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Capacidad: {espacio.capacidad} personas</span>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => navigate(`/crear-reserva?espacio=${espacio.id_espacio}`)}
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Espacios;
