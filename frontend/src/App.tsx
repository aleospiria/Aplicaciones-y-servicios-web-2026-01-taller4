import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Espacios from "./pages/Espacios";
import CrearReserva from "./pages/CrearReserva";
import MisReservas from "./pages/MisReservas";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/espacios"
          element={
            <ProtectedRoute>
              <Espacios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-reserva"
          element={
            <ProtectedRoute>
              <CrearReserva />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute>
              <MisReservas />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
