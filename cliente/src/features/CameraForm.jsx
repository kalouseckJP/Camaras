import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function CameraForm() {
  const [cameraName, setCameraName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Función para guardar en la base de datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Obtenemos el token del localStorage (para el middleware)
      const token = localStorage.getItem('token');

      // 2. Hacemos la petición POST
      await api.post('/cameras', {
        name: cameraName,
        ip: ipAddress,
        streamUrl: streamUrl
      }, {
        headers: { Authorization: `Bearer ${token}` } // Enviamos el token
      });

      alert('Cámara guardada exitosamente');
      // Redirigimos a la vista en vivo o lista de cámaras
      navigate('/live'); 

    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la cámara');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 max-w-2xl mx-auto">
      <h2 className="dark:text-white text-2xl mb-6 font-semibold">Registrar Nueva Cámara</h2>

      {/* Nombre */}
      <div className="mb-4">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">Nombre Referencial</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-indigo-500"
          placeholder="Ej: Cámara Entrada"
          value={cameraName}
          onChange={(e) => setCameraName(e.target.value)}
          required
        />
      </div>

      {/* IP */}
      <div className="mb-4">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">Dirección IP (Opcional)</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-indigo-500"
          placeholder="Ej: 192.168.1.50"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
        />
      </div>

      {/* Stream URL */}
      <div className="mb-6">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">URL del Stream (MJPEG/HLS/RTSP)</label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-indigo-500"
          placeholder="Ej: http://192.168.1.50:8081/stream"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Esta es la URL que usará el sistema para visualizar el video.</p>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`bg-indigo-400 dark:bg-indigo-600 dark:text-white font-bold py-2 px-6 rounded hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Guardando...' : 'Guardar Cámara'}
        </button>
      </div>
    </form>
  );
}

export default CameraForm;