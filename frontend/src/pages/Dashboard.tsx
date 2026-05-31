import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <nav>
        <h2>Gestión de Reservas</h2>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </nav>
      <div className="dashboard-content">
        <h1>Bienvenido</h1>
        <p>Has iniciado sesión correctamente.</p>
      </div>
    </div>
  );
}

export default Dashboard;
