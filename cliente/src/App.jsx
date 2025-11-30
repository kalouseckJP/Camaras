// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Importar el hook

// Layouts y Páginas
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import LiveViewPage from './pages/LiveViewPage';
import AddCameraPage from './pages/AddCameraPage';
import CamerasPage from './pages/CamerasPage';
import EditCameraPage from './pages/EditCameraPage';
import UsersPage from './pages/UsersPage';
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';
import RecordingsPage from './pages/RecordingsPage';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';


// Importar el guardia
import ProtectedRoute from './router/ProtectedRoute';

// Componente especial para la ruta raíz "/"
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  
  // Si estoy logueado, ir a "/live". Si no, a "/login".
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
}

function App() {
  return (
    <Routes>
      {/* 1. Redirección de la ruta raíz */}
      

      {/* 2. Rutas Públicas (Login) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* 3. Rutas Protegidas (Dashboard) */}
      <Route element={<ProtectedRoute />}> {/* <-- El Guardia */}
        <Route element={<DashboardLayout />}>
        {/* Ruta raíz redirige a Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage />} />
 
          
          <Route path="/live" element={<LiveViewPage />} />
          <Route path="/agregar" element={<AddCameraPage />} />
          <Route path="/cameras" element={<CamerasPage />} />
          <Route path="/editar-camera/:id" element={<EditCameraPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/add-user" element={<AddUserPage />} />
          <Route path="/edit-user/:id" element={<EditUserPage />} />
          <Route path="/grabaciones" element={<RecordingsPage />} />
          <Route path="/logs" element={<LogsPage />} />
          {/* <Route path="/admin" element={<AdminPage />} /> */}
        
        </Route>
      </Route>

      {/* 4. Ruta para "No Encontrado" */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}

    </Routes>
  );
}

export default App;