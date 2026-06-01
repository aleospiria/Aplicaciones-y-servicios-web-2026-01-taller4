import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

interface Reserva {
  id_reserva: number;
  id_espacio: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cantidad_asistentes: number;
  estado: string;
}

interface Espacio {
  id_espacio: number;
  nombre: string;
}

function MisReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [reservasData, espaciosData] = await Promise.all([
        api.getMisReservas(),
        api.getEspacios(),
      ]);
      setReservas(reservasData);
      setEspacios(espaciosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getNombreEspacio = (id: number) =>
    espacios.find((e) => e.id_espacio === id)?.nombre || "Espacio #" + id;

  const getEstadoBadge = (estado: string) => {
    const classes: Record<string, string> = {
      esperando: "badge-warning",
      aprobada: "badge-success",
      rechazada: "badge-error",
    };
    return classes[estado] || "badge-default";
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    try {
      await api.deleteReserva(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cancelar");
    }
  };

  if (loading)
    return (
      <div className="page-container">
        <Navbar />
        <p className="loading">Cargando reservas...</p>
      </div>
    );

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1>Mis reservas</h1>
          <p className="subtitle">
            {reservas.length} reserva{reservas.length !== 1 ? "s" : ""} realizada
           {reservas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && <p className="error">{error}</p>}

        {reservas.length === 0 && !error && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>No tienes reservas aún</p>
            <button className="btn-primary" onClick={() => navigate("/espacios")}>
              Reservar un espacio
            </button>
          </div>
        )}

        <div className="reservas-list">
          {reservas.map((reserva) => (
            <div key={reserva.id_reserva} className="reserva-card">
              <div className="reserva-top">
                <h3>{getNombreEspacio(reserva.id_espacio)}</h3>
                <span className={`badge ${getEstadoBadge(reserva.estado)}`}>
                  {reserva.estado}
                </span>
              </div>
              <div className="reserva-details">
                <div className="reserva-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatDate(reserva.fecha)}</span>
                </div>
                <div className="reserva-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    {reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}
                  </span>
                </div>
                <div className="reserva-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span>{reserva.cantidad_asistentes} asistentes</span>
                </div>
              </div>
              {reserva.estado === "esperando" && (
                <button
                  className="btn-cancel"
                  onClick={() => handleCancel(reserva.id_reserva)}
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MisReservas;
