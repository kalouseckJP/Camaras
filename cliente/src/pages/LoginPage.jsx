import React, { useState, useEffect } from 'react'; // <--- 1. Importar useEffect
import { useNavigate } from 'react-router-dom';      // <--- 2. Importar useNavigate
import { useAuth } from '../contexts/AuthContext'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth(); // <--- 3. Traer isAuthenticated
  const navigate = useNavigate();               // <--- 4. Instanciar navigate

  // ---------------------------------------------------------
  // LÓGICA DE REDIRECCIÓN
  // ---------------------------------------------------------
  useEffect(() => {
    // Si el usuario YA está autenticado...
    if (isAuthenticated) {
      // ...lo mandamos directo al dashboard
      navigate('/live', { replace: true }); 
      // 'replace: true' evita que pueda volver atrás al login con la flecha del navegador
    }
  }, [isAuthenticated, navigate]);
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Nota: No necesitamos navegar aquí manualmente si el login es exitoso,
    // porque AuthContext ya hace el navigate, o este useEffect se activará
    // cuando isAuthenticated cambie a true.
    const success = await login(username, password);
    
    if (!success) {
      setError('Nombre de usuario o contraseña incorrectos');
    }
  };

  if (isAuthenticated) return null;

  return (
    <form 
      className="bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-700" 
      onSubmit={handleSubmit}
    >
      
      <h2 
        className="dark:text-white text-2xl font-semibold mb-6 text-center"
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
          className="block dark:text-gray-300 text-sm font-bold mb-2"
        >
          Nombre de Usuario
        </label>
        <input
          type="text" id="username"
          // Aquí estaban los "..."
          className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 placeholder-gray-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      
      <div className="mb-6">
        <label 
          htmlFor="password" 
          // Aquí estaban los "..."
          className="block dark:text-gray-300 text-sm font-bold mb-2"
        >
          Contraseña
        </label>
        <input
          type="password" id="password"
          // Aquí estaban los "..."
          className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 dark:text-gray-100 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 dark:placeholder-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <div className="flex items-center justify-center">
        {/* Asegúrate de que el botón sea type="submit" */}
        <button
          // Aquí estaban los "..."
          className="bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          type="submit"
        >
          Ingresar
        </button>
      </div>
    </form>
  );
}

export default LoginPage;