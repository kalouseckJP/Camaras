import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditCameraPage() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    stream_url_main: '',
    stream_url_sub: ''
  });
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos de la cámara al entrar
  useEffect(() => {
    const fetchCamera = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/cameras/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Rellenar el estado con los datos que vinieron de la BD
        setFormData({
          name: response.data.name,
          ip_address: response.data.ip_address || '',
          stream_url_main: response.data.stream_url_main,
          stream_url_sub: response.data.stream_url_sub
        });
      } catch (error) {
        alert('Error al cargar la cámara');
        navigate('/cameras');
      } finally {
        setLoading(false);
      }
    };
    fetchCamera();
  }, [id, navigate]);

  // 2. Guardar cambios (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put(`/cameras/${id}`, {
        name: formData.name,
        ip: formData.ip_address,
        streamUrlMain: formData.stream_url_main,
        streamUrlSub: formData.stream_url_sub
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Cámara actualizada');
      navigate('/cameras'); // Volver a la lista
    } catch (error) {
      alert('Error al actualizar',error);
    }
  };

  if (loading) return <div className="dark:text-white p-8">Cargando datos...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl mx-auto mt-10">
      <h2 className="dark:text-white text-2xl mb-6 font-semibold">Editar Cámara</h2>

      <div className="mb-4">
        <label className="block dark:text-gray-300 mb-2">Nombre</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white rounded p-2 border border-gray-700"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block dark:text-gray-300 mb-2">IP</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white rounded p-2 border border-gray-700"
          value={formData.ip_address}
          onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
        />
      </div>

      <div className="mb-6">
        <label className="block dark:text-gray-300 mb-2">Stream URL</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white rounded p-2 border border-gray-700"
          value={formData.stream_url_main}
          onChange={(e) => setFormData({...formData, stream_url_main: e.target.value})}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block dark:text-gray-300 mb-2">Sub-stream URL</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white rounded p-2 border border-gray-700"
          value={formData.stream_url_sub}
          onChange={(e) => setFormData({...formData, stream_url_sub: e.target.value})}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button 
          type="button"
          onClick={() => navigate('/cameras')}
          className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white font-bold py-2 px-4 hover:cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-indigo-400 dark:bg-blue-600 hover:bg-indigo-500 dark:hover:bg-blue-700 text-white font-bold py-2 px-6 rounded hover:cursor-pointer"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}

export default EditCameraPage;