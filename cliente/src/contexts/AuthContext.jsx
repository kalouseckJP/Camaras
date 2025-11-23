import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // <--- 1. IMPORTAMOS NUESTRA INSTANCIA DE AXIOS

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Estado inicial: Busca usuario y token en localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
      // 2. LLAMADA REAL AL BACKEND
      // Enviamos POST a http://localhost:3000/api/auth/login
      const response = await api.post('/auth/login', { username, password });
      
      // Si llegamos aquí, el backend respondió con éxito (Status 200)
      const { user: userData, token } = response.data;

      // 3. GUARDAR DATOS
      setUser(userData);
      
      // Guardamos usuario Y token para que la sesión persista
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token); // <-- IMPORTANTE: Guardar el token

      // 4. REDIRIGIR
      navigate('/live');
      return true; // Éxito

    } catch (error) {
      // Si falla (credenciales mal, servidor apagado, etc.)
      console.error("Error de login:", error.response?.data || error.message);
      
      // Retornamos false para que el formulario muestre el error
      return false; 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // ... (El resto del código del useEffect se queda igual) ...
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) setUser(null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAdmin = user?.role_id === 1;
  const value = { user, isAuthenticated: !!user, isAdmin, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}