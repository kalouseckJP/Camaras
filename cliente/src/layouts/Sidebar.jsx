// src/layouts/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {

  // Clases base para los enlaces
  const baseLinkClasses = "flex items-center p-3 rounded-lg transition-colors duration-200";
  // Función para determinar las clases del NavLink (activo vs inactivo)
  const getNavLinkClasses = ({ isActive }) => 
    isActive
      ? `${baseLinkClasses} bg-indigo-600 text-white` // Estilo activo
      : `${baseLinkClasses} text-gray-300 hover:bg-gray-700`; // Estilo inactivo

  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col h-full">
      {/* Logo o Título */}
      <div className="text-white text-2xl font-bold mb-8 p-3">
        App Cámaras
      </div>

      {/* Navegación */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <NavLink to="/live" className={getNavLinkClasses}>
              {/* Puedes añadir íconos aquí */}
              <span>Vista en Vivo</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/recordings" className={getNavLinkClasses}>
              <span>Grabaciones</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin" className={getNavLinkClasses}>
              <span>Administración</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;