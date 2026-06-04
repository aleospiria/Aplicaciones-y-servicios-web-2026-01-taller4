const BASE = "";

async function request(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(error.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (correo: string, contraseña: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, contraseña }),
    }),

  register: (nombre: string, correo: string, contraseña: string, rol = "usuario") =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombre, correo, contraseña, rol }),
    }),

  getEspacios: () => request("/espacios/"),

  createReserva: (data: unknown) =>
    request("/reservas/", { method: "POST", body: JSON.stringify(data) }),

  getMisReservas: () => request("/reservas/"),

  updateEstadoReserva: (id: number, estado: string) =>
    request(`/reservas/${id}/estado?nuevo_estado=${estado}`, { method: "PUT" }),

  deleteReserva: (id: number) =>
    request(`/reservas/${id}`, { method: "DELETE" }),

  getUsuarios: () => request("/usuarios/"),

  createUsuario: (data: { nombre: string; correo: string; contraseña: string; rol?: string }) =>
    request("/usuarios/", { method: "POST", body: JSON.stringify(data) }),

  createEspacio: (data: unknown) =>
    request("/espacios/", { method: "POST", body: JSON.stringify(data) }),

  updateEspacio: (id: number, data: unknown) =>
    request(`/espacios/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteEspacio: (id: number) =>
    request(`/espacios/${id}`, { method: "DELETE" }),
};
