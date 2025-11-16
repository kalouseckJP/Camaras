// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear el Proveedor (el componente que "envuelve" la app)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = no logueado
  const navigate = useNavigate();

  // Función para iniciar sesión
  const login = (username, password) => {
    // ---
    // AQUÍ IRÍA TU LÓGICA DE API PARA VALIDAR
    // ---
    
    // Simulación de login exitoso:
    if (username === 'admin' && password === '123') {
      const userData = { id: 1, name: 'Admin' };
      setUser(userData);
      
      // Opcional: guardar en localStorage para persistir la sesión
      // localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirigir al dashboard (o a la página principal de la app)
      navigate('/live'); // O la ruta que quieras, ej: '/dashboard'
      
      return true;
    }
    return false; // Login fallido
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    // Opcional: limpiar localStorage
    // localStorage.removeItem('user');
    
    // Enviar al login
    navigate('/login');
  };

  // El valor que compartiremos con toda la app
  const value = {
    user,
    isAuthenticated: !!user, // !!user convierte a booleano (true si hay usuario, false si es null)
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Hook personalizado (para consumir el contexto fácilmente)
export function useAuth() {
  return useContext(AuthContext);
}