import React from 'react';
import { Outlet } from 'react-router-dom'; // Importa Outlet

function AuthLayout() {
  return (
    // Contenedor principal: Ocupa toda la pantalla, fondo oscuro y centra el contenido
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      
      {/* Outlet renderizará la página "hija" (en este caso, LoginPage) */}
      <Outlet /> 

    </div>
  );
}

export default AuthLayout;