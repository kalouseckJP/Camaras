// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // <-- Importar el hook

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth(); // <-- Obtener la función login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Simulación de login (admin/123)
      const success = await login(username, password); 
      if (!success) {
        setError('Nombre de usuario o contraseña incorrectos');
      }
      // Si el login es exitoso, el AuthProvider nos redirigirá automáticamente
    } catch (err) {
      setError('Ocurrió un error. Intente de nuevo.');
    }
  };

  return (
    // Asegúrate de que tu <div> principal sea un <form>
    <form 
      // Aquí estaban los "..."
      className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-700" 
      onSubmit={handleSubmit}
    >
      
      <h2 
        // Aquí estaban los "..."
        className="text-white text-2xl font-semibold mb-6 text-center"
      >
        Iniciar Sesión
      </h2>
      
      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm text-center">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label 
          htmlFor="username" 
          // Aquí estaban los "..."
          className="block text-gray-300 text-sm font-bold mb-2"
        >
          Nombre de Usuario
        </label>
        <input
          type="text" id="username"
          // Aquí estaban los "..."
          className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 placeholder-gray-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      
      <div className="mb-6">
        <label 
          htmlFor="password" 
          // Aquí estaban los "..."
          className="block text-gray-300 text-sm font-bold mb-2"
        >
          Contraseña
        </label>
        <input
          type="password" id="password"
          // Aquí estaban los "..."
          className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-gray-100 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 placeholder-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <div className="flex items-center justify-center">
        {/* Asegúrate de que el botón sea type="submit" */}
        <button
          // Aquí estaban los "..."
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          type="submit"
        >
          Ingresar
        </button>
      </div>
    </form>
  );
}

export default LoginPage;