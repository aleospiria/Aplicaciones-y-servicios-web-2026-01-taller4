import { useState, useEffect } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

interface Reserva {
  id_reserva: number;
  id_usuario: number;
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

interface Usuario {
  id_usuario: number;
  nombre: string;
}

function AprobarReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      const [reservasData, espaciosData, usuariosData] = await Promise.all([
        api.getMisReservas(),
        api.getEspacios(),
        api.getUsuarios(),
      ]);
      setReservas(reservasData);
      setEspacios(espaciosData);
      setUsuarios(usuariosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: number, estado: string) => {
    setError("");
    setSuccess("");
    try {
      await api.updateEstadoReserva(id, estado);
      setSuccess(
        `Reserva #${id} ${estado === "aprobada" ? "aprobada" : "rechazada"} exitosamente`
      );
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const getNombreEspacio = (id: number) =>
    espacios.find((e) => e.id_espacio === id)?.nombre || `#${id}`;

  const getNombreUsuario = (id: number) =>
    usuarios.find((u) => u.id_usuario === id)?.nombre || `#${id}`;

  if (loading)
    return (
      <div className="page-container">
        <Navbar />
        <p className="loading">Cargando...</p>
      </div>
    );

  const pendientes = reservas.filter((r) => r.estado === "esperando");
  const historial = reservas.filter((r) => r.estado !== "esperando");

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1>Aprobar reservas</h1>
          <p className="subtitle">
            {pendientes.length} reserva{pendientes.length !== 1 ? "s" : ""}{" "}
            pendiente{pendientes.length !== 1 ? "s" : ""} de aprobación
          </p>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <h2 className="section-title">Pendientes</h2>

        {pendientes.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 0" }}>
            <p>No hay reservas pendientes</p>
          </div>
        ) : (
          <div className="reservas-list" style={{ marginBottom: 40 }}>
            {pendientes.map((r) => (
              <div key={r.id_reserva} className="reserva-card aprobar-card">
                <div className="reserva-top">
                  <h3>{getNombreEspacio(r.id_espacio)}</h3>
                  <span className="badge badge-warning">esperando</span>
                </div>
                <div className="reserva-details">
                  <div className="reserva-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{getNombreUsuario(r.id_usuario)}</span>
                  </div>
                  <div className="reserva-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{new Date(r.fecha).toLocaleDateString("es-CO")}</span>
                  </div>
                  <div className="reserva-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>
                      {r.hora_inicio.slice(0, 5)} - {r.hora_fin.slice(0, 5)}
                    </span>
                  </div>
                  <div className="reserva-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <span>{r.cantidad_asistentes} asistentes</span>
                  </div>
                </div>
                <div className="aprobar-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleAction(r.id_reserva, "aprobada")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Aprobar
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleAction(r.id_reserva, "rechazada")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {historial.length > 0 && (
          <>
            <h2 className="section-title">Historial</h2>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Espacio</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Asistentes</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((r) => (
                    <tr key={r.id_reserva}>
                      <td>{r.id_reserva}</td>
                      <td>{getNombreUsuario(r.id_usuario)}</td>
                      <td>{getNombreEspacio(r.id_espacio)}</td>
                      <td>{new Date(r.fecha).toLocaleDateString("es-CO")}</td>
                      <td>
                        {r.hora_inicio.slice(0, 5)} - {r.hora_fin.slice(0, 5)}
                      </td>
                      <td>{r.cantidad_asistentes}</td>
                      <td>
                        <span
                          className={`badge ${r.estado === "aprobada" ? "badge-success" : "badge-error"}`}
                        >
                          {r.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AprobarReservas;
