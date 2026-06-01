import { useState, useEffect } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

interface Espacio {
  id_espacio: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: string;
}

function GestionarEspacios() {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    capacidad: 1,
    estado: "activo",
  });

  const fetchEspacios = async () => {
    try {
      const data = await api.getEspacios();
      setEspacios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacios();
  }, []);

  const resetForm = () =>
    setForm({ nombre: "", ubicacion: "", capacidad: 1, estado: "activo" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.createEspacio(form);
      resetForm();
      fetchEspacios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    }
  };

  const handleUpdate = async (id: number) => {
    setError("");
    try {
      await api.updateEspacio(id, form);
      setEditing(null);
      resetForm();
      fetchEspacios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este espacio?")) return;
    setError("");
    try {
      await api.deleteEspacio(id);
      fetchEspacios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const startEdit = (espacio: Espacio) => {
    setEditing(espacio.id_espacio);
    setForm({
      nombre: espacio.nombre,
      ubicacion: espacio.ubicacion,
      capacidad: espacio.capacidad,
      estado: espacio.estado,
    });
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
          <h1>Gestionar espacios</h1>
          <p className="subtitle">Administra los espacios disponibles</p>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>
            {editing ? "Editar espacio" : "Nuevo espacio"}
          </h3>
          <form
            onSubmit={
              editing
                ? (e) => {
                    e.preventDefault();
                    handleUpdate(editing);
                  }
                : handleCreate
            }
          >
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <input
                  value={form.ubicacion}
                  onChange={(e) =>
                    setForm({ ...form, ubicacion: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Capacidad</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacidad}
                  onChange={(e) =>
                    setForm({ ...form, capacidad: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="en mantenimiento">En mantenimiento</option>
                  <option value="no disponible">No disponible</option>
                </select>
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn-primary btn-sm-inline">
                {editing ? "Guardar cambios" : "Crear espacio"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setEditing(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {espacios.map((e) => (
                <tr key={e.id_espacio}>
                  <td>{e.id_espacio}</td>
                  <td>{e.nombre}</td>
                  <td>{e.ubicacion}</td>
                  <td>{e.capacidad}</td>
                  <td>
                    <span
                      className={`badge ${e.estado === "activo" ? "badge-success" : "badge-warning"}`}
                    >
                      {e.estado}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-table btn-edit" onClick={() => startEdit(e)}>
                      Editar
                    </button>
                    <button
                      className="btn-table btn-delete"
                      onClick={() => handleDelete(e.id_espacio)}
                    >
                      Eliminar
                    </button>
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

export default GestionarEspacios;
