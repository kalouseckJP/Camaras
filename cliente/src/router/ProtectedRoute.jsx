// src/router/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importar nuestro hook

function ProtectedRoute() {
  const { isAuthenticated } = useAuth(); // Usar el contexto

  if (!isAuthenticated) {
    // Si no está autenticado, redirigir a /login
    // 'replace' evita que el usuario pueda "volver" con la flecha del navegador
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza la ruta hija (la página)
  // Outlet es el "espacio" donde React Router pondrá el componente
  // (ej: DashboardLayout, LiveViewPage, etc.)
  return <Outlet />;
}

export default ProtectedRoute;