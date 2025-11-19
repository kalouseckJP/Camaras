import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function CamerasPage() {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  // 1. Cargar cámaras al entrar
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cameras', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCameras(response.data);
    } catch (error) {
      console.error('Error cargando cámaras:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Función para borrar
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cámara?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/cameras/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Recargar la lista
      fetchCameras(); 
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="text-white p-8">Cargando listado...</div>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Cámaras</h1>
        
        {/* Botón para ir a "Añadir Cámara" */}
        <Link 
          to="/agregar" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          + Nueva Cámara
        </Link>
      </div>

      {/* TABLA TAILWIND */}
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                IP / URL
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {cameras.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-5 bg-gray-800 text-sm text-gray-300 text-center">
                  No hay cámaras registradas.
                </td>
              </tr>
            ) : (
              cameras.map((cam) => (
                <tr key={cam.camera_id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm text-white">
                    {cam.camera_id}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm text-white">
                    <div className="font-bold">{cam.name}</div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm text-gray-300">
                    <p>{cam.ip_address || 'N/A'}</p>
                    <p className="text-xs text-gray-500 truncate w-48">{cam.stream_url_main}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cam.current_status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cam.current_status}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                    <div className="flex space-x-3">
                      {/* Botón Editar (Navega a una ruta de edición, o reusa el form) */}
                      <button
                        onClick={() => navigate(`/editar-camera/${cam.camera_id}`)}
                        className="text-blue-400 hover:text-blue-300">
                        Editar
                      </button>
                      
                      {/* Botón Eliminar */}
                      <button 
                        onClick={() => handleDelete(cam.camera_id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CamerasPage;