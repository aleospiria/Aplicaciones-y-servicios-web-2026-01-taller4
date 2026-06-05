import { useState, useEffect } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function GestionarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    rol: "usuario" as "usuario" | "admin",
  });

  const fetchUsuarios = async () => {
    try {
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const resetForm = () =>
    setForm({ nombre: "", correo: "", contraseña: "", rol: "usuario" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createUsuario(form);
      resetForm();
      fetchUsuarios();
      setSuccess("Usuario creado correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    }
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
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <h1 style={{ margin: 0 }}>Gestionar usuarios</h1>
          </div>
          <p className="subtitle">Crea nuevos usuarios y administradores, o visualiza el directorio del sistema</p>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div
          style={{
            background: "#0f172a",
            borderRadius: 16,
            padding: 32,
            border: "1px solid #1e293b",
            maxWidth: 600,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#0a1628",
                border: "2px dashed #1e3a5f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60a5fa",
                flexShrink: 0,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
                Nuevo usuario
              </h3>
              <p style={{ fontSize: 14, color: "#64748b" }}>
                Ingresa los datos para crear un nuevo usuario o administrador
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. María Pérez"
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={form.contraseña}
                  onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Rol del usuario</label>
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, rol: "usuario" })}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `2px solid ${form.rol === "usuario" ? "#3b82f6" : "#1e293b"}`,
                      background: form.rol === "usuario" ? "#0a1628" : "transparent",
                      color: form.rol === "usuario" ? "#60a5fa" : "#94a3b8",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Usuario</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Solo reservar</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, rol: "admin" })}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `2px solid ${form.rol === "admin" ? "#f59e0b" : "#1e293b"}`,
                      background: form.rol === "admin" ? "#1e1a0a" : "transparent",
                      color: form.rol === "admin" ? "#f59e0b" : "#94a3b8",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Administrador</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Aprueba y gestiona</div>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
              <button
                type="submit"
                className="btn-primary btn-sm-inline"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Crear usuario
              </button>
            </div>
          </form>
        </div>

        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Directorio de usuarios
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario}>
                  <td>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: u.rol === "admin" ? "#1e1a0a" : "#0a1628",
                        border: `2px solid ${u.rol === "admin" ? "#f59e0b" : "#1e3a5f"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: u.rol === "admin" ? "#f59e0b" : "#60a5fa",
                      }}
                    >
                      {getInitials(u.nombre)}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                  <td style={{ color: "#94a3b8" }}>{u.correo}</td>
                  <td>
                    <span
                      className={`badge ${u.rol === "admin" ? "badge-warning" : "badge-info"}`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {u.rol === "admin" ? "Administrador" : "Usuario"}
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

export default GestionarUsuarios;
