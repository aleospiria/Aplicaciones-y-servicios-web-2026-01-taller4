import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const rol = localStorage.getItem("rol");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/login");
  };

  const userTabs = [
    { path: "/espacios", label: "Espacios" },
    { path: "/mis-reservas", label: "Mis Reservas" },
  ];

  const adminTabs = [
    { path: "/admin/gestionar-espacios", label: "Gestionar Espacios" },
    { path: "/admin/todas-reservas", label: "Todas las Reservas" },
    { path: "/admin/aprobar-reservas", label: "Aprobar Reservas" },
  ];

  const tabs = rol === "admin" ? adminTabs : userTabs;

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/espacios")}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Reservas</span>
      </div>

      <div className="navbar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`navbar-tab ${location.pathname === tab.path ? "active" : ""}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button className="navbar-logout" onClick={handleLogout}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Salir
      </button>
    </nav>
  );
}

export default Navbar;
