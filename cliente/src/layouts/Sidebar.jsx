// src/layouts/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar({ isOpen = true, onToggle }) {
  const { isAdmin } = useAuth();

  // Clases base para los enlaces
  const baseLinkClasses = "flex items-center p-3 rounded-lg transition-colors duration-180";
  // Función para determinar las clases del NavLink (activo vs inactivo)
  const getNavLinkClasses = ({ isActive }) => 
    isActive
      ? `${baseLinkClasses} bg-indigo-400 dark:bg-indigo-600 text-white hover:bg-indigo-500` // Estilo activo
      : `${baseLinkClasses} hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700`; // Estilo inactivo

  return (
    <aside className={`flex flex-col h-full bg-gray-200 dark:bg-gray-800 transition-width duration-300 ${isOpen ? 'w-64' : 'w-16'} p-2`}>
      {/* Logo o Título */}
      <div className={`dark:text-white text-2xl font-bold mb-6 p-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        App Cámaras
      </div>

      {/* Navegación */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <NavLink to="/live" className={getNavLinkClasses}>
              <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Vista en Vivo</span>
              {!isOpen && <span className="mx-auto">●</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/ordenar" className={getNavLinkClasses}>
              <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Ordenar Cámaras</span>
              {!isOpen && <span className="mx-auto">●</span>}
            </NavLink>
          </li>
          {isAdmin && (
            <>
            <li>
            <NavLink to="/cameras" className={getNavLinkClasses}>
              <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Gestión de Cámaras</span>
              {!isOpen && <span className="mx-auto">●</span>}
            </NavLink>
            </li>
            <li>
              <NavLink to="/administrar" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Administrar permisos</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/logs" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Logs</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/grabaciones" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Programar grabaciones</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/editar" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Editar cámaras</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/notificaciones" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Notificaciones</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/almacenamiento" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Almacenamiento</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/grabaciones" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Grabaciones</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/users" className={getNavLinkClasses}>
                <span className={`${isOpen ? 'ml-2 inline' : 'sr-only'}`}>Gestión de Usuarios</span>
                {!isOpen && <span className="mx-auto">●</span>}
              </NavLink>
            </li>
            </>
          )}
        </ul>
      </nav>

      {/* Toggle interno opcional */}
      <div className="p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-md bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm hover:cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isOpen ? 'Cerrar' : '●'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;