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

function TodasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getNombreEspacio = (id: number) =>
    espacios.find((e) => e.id_espacio === id)?.nombre || `#${id}`;

  const getNombreUsuario = (id: number) =>
    usuarios.find((u) => u.id_usuario === id)?.nombre || `#${id}`;

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      esperando: "badge-warning",
      aprobada: "badge-success",
      rechazada: "badge-error",
    };
    return map[estado] || "badge-default";
  };

  if (loading)
    return (
      <div className="page-container">
        <Navbar />
        <p className="loading">Cargando...</p>
      </div>
    );

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1>Todas las reservas</h1>
          <p className="subtitle">
            {reservas.length} reserva{reservas.length !== 1 ? "s" : ""} en total
          </p>
        </div>

        {error && <p className="error">{error}</p>}

        {reservas.length === 0 && !error && (
          <div className="empty-state">
            <p>No hay reservas registradas</p>
          </div>
        )}

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
              {reservas.map((r) => (
                <tr key={r.id_reserva}>
                  <td>{r.id_reserva}</td>
                  <td>{getNombreUsuario(r.id_usuario)}</td>
                  <td>{getNombreEspacio(r.id_espacio)}</td>
                  <td>
                    {new Date(r.fecha).toLocaleDateString("es-CO")}
                  </td>
                  <td>
                    {r.hora_inicio.slice(0, 5)} - {r.hora_fin.slice(0, 5)}
                  </td>
                  <td>{r.cantidad_asistentes}</td>
                  <td>
                    <span
                      className={`badge ${getEstadoBadge(r.estado)}`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TodasReservas;
