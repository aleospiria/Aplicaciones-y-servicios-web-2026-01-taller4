import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

interface Espacio {
  id_espacio: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: string;
}

function CrearReserva() {
  const [searchParams] = useSearchParams();
  const espacioIdParam = searchParams.get("espacio");

  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [idEspacio, setIdEspacio] = useState(espacioIdParam || "");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [cantidadAsistentes, setCantidadAsistentes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEspacios().then((data) => setEspacios(data));
  }, []);

  const espacioSeleccionado = espacios.find(
    (e) => e.id_espacio === Number(idEspacio)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.createReserva({
        id_espacio: Number(idEspacio),
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        cantidad_asistentes: Number(cantidadAsistentes),
      });
      setSuccess("Reserva creada exitosamente");
      setTimeout(() => navigate("/mis-reservas"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <h1>Nueva reserva</h1>
          <p className="subtitle">Completa los datos para solicitar un espacio</p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <div className="form-group">
              <label htmlFor="espacio">Espacio</label>
              <select
                id="espacio"
                value={idEspacio}
                onChange={(e) => setIdEspacio(e.target.value)}
                required
              >
                <option value="">Selecciona un espacio</option>
                {espacios
                  .filter((e) => e.estado === "activo")
                  .map((e) => (
                    <option key={e.id_espacio} value={e.id_espacio}>
                      {e.nombre} - {e.ubicacion}
                    </option>
                  ))}
              </select>
            </div>

            {espacioSeleccionado && (
              <p className="field-hint">
                Capacidad máxima: {espacioSeleccionado.capacidad} personas
              </p>
            )}

            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="horaInicio">Hora inicio</label>
                <input
                  id="horaInicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="horaFin">Hora fin</label>
                <input
                  id="horaFin"
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="asistentes">Cantidad de asistentes</label>
              <input
                id="asistentes"
                type="number"
                min="1"
                value={cantidadAsistentes}
                onChange={(e) => setCantidadAsistentes(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Solicitar reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearReserva;
