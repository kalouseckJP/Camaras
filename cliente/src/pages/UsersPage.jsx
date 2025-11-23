import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar');
    }
  };

  if (loading) return <div className="text-white p-8">Cargando usuarios...</div>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
        <Link to="/add-user" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          + Nuevo Usuario
        </Link>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase">ID</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase">Usuario</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase">Rol</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase">Fecha Creación</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-700 transition-colors">
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm text-white">{user.user_id}</td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm text-white font-bold">{user.username}</td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role_name === 'Administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role_name}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-5 ...">
                    <div className="flex space-x-3">
                        
                        {/* BOTÓN EDITAR CONECTADO */}
                        <Link 
                        to={`/edit-user/${user.user_id}`}
                        className="text-blue-400 hover:text-blue-300"
                        >
                        Editar
                        </Link>

                        <button onClick={() => handleDelete(user.user_id)} className="text-red-400 hover:text-red-300">
                        Eliminar
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;