import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AddUserPage() {
  const [formData, setFormData] = useState({ username: '', password: '', role_id: '2' }); // Por defecto rol 2 (Usuario)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Usuario creado con éxito');
      navigate('/users');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md mx-auto mt-10 border border-gray-700">
      <h2 className="dark:text-white text-2xl mb-6 font-semibold">Registrar Nuevo Usuario</h2>

      <div className="mb-4">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">Nombre de Usuario</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 ext-black dark:text-white border border-gray-600 rounded p-2"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">Contraseña</label>
        <input
          type="password"
          className="w-full bg-gray-100 dark:bg-gray-700 ext-black dark:text-white border border-gray-600 rounded p-2"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">Rol</label>
        <select
          className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-600 rounded p-2"
          value={formData.role_id}
          onChange={(e) => setFormData({...formData, role_id: e.target.value})}
        >
          <option value="1">Administrador</option>
          <option value="2">Usuario / Operador</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-indigo-400 dark:bg-indigo-600 hover:bg-indigo-500 dark:hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded">
          Guardar Usuario
        </button>
      </div>
    </form>
  );
}

export default AddUserPage;