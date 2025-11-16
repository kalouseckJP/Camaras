// src/layouts/Header.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Importamos el hook de autenticación

function Header() {
  const { user, logout } = useAuth(); // Obtenemos el usuario y la función logout

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="flex justify-end items-center max-w-7xl mx-auto">
        
        {/* Mostramos el nombre del usuario */}
        <span className="text-white mr-4">
          Hola, {user ? user.name : 'Usuario'}
        </span>
        
        {/* Botón de Logout */}
        <button
          onClick={logout} // Al hacer click, llamamos a la función logout del AuthContext
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded 
                     transition-colors duration-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

export default Header;