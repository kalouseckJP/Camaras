import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '', // Si usas email
    role_id: '2',
    password: '' // Empezamos vacía. Si se queda vacía, no se cambia.
  });

  // 1. Cargar datos del usuario al entrar
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Rellenamos el formulario (menos la contraseña)
        setFormData({
          username: response.data.username,
          email: response.data.email || '',
          role_id: response.data.role_id,
          password: '' // La contraseña no la traemos del server por seguridad
        });
      } catch (error) {
        alert('Error al cargar usuario');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  // 2. Enviar formulario (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Preparamos los datos
      const payload = {
        username: formData.username,
        email: formData.email,
        role_id: formData.role_id,
        password: formData.password // Si va vacía, el backend la ignora
      };

      await api.put(`/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Usuario actualizado correctamente');
      navigate('/users');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar');
    }
  };

  if (loading) return <div className="dark:text-white p-8">Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md mx-auto mt-10 border border-gray-700">
      <h2 className="text-white text-2xl mb-6 font-semibold">Editar Usuario</h2>

      {/* Username */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-bold mb-2">Nombre de Usuario</label>
        <input
          type="text"
          className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>

      {/* Rol */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-bold mb-2">Rol</label>
        <select
          className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
          value={formData.role_id}
          onChange={(e) => setFormData({...formData, role_id: e.target.value})}
        >
          <option value="1">Administrador</option>
          <option value="2">Usuario / Operador</option>
        </select>
      </div>

      {/* Contraseña (Opcional) */}
      <label className="block text-gray-300 text-sm font-bold mb-2">
          Cambiar Contraseña (Opcional)
        </label>
      <div className="mb-6 p-4 bg-gray-700 rounded border border-gray-700">
        
        <input
          type="password"
          className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 placeholder-gray-500"
          placeholder="Dejar en blanco para mantener la actual"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3">
        <button 
          type="button" 
          onClick={() => navigate('/users')}
          className="text-gray-400 hover:text-white font-bold py-2 px-4"
        >
          Cancelar
        </button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}

export default EditUserPage;