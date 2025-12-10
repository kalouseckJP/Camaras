import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import TrimModal from '../features/recordings/TrimModal'; // El componente modal que creamos

function RecordingsPage() {
  // --- ESTADOS ---
  const [recordings, setRecordings] = useState([]);
  const [cameras, setCameras] = useState([]);
  
  // Filtros
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');
  const [showCameras, setShowCameras] = useState([])
  
  // Modal de Recorte
  const [trimmingVideo, setTrimmingVideo] = useState(null); // Guarda el video seleccionado para recortar

  const { isAdmin } = useAuth(); // Permiso de administrador

  // --- EFECTOS ---
  
  // 1. Cargar lista de cámaras para el filtro
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/cameras', { headers: { Authorization: `Bearer ${token}` } });
        setCameras(res.data);
      } catch (err) {
        console.error("Error cargando cámaras", err);
      }
    };
    fetchCameras();
  }, []);

  // 2. Cargar grabaciones (se ejecuta al inicio y al cambiar filtros)
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = '/recordings?';
        if (selectedDate) url += `start_time=${selectedDate}&`;
        if (selectedCamera) url += `cameraId=${selectedCamera}`;

        const res = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setRecordings(res.data);
      } catch (err) {
        console.error("Error cargando grabaciones", err);
      }
    };
    fetchRecs();
  }, [selectedDate, selectedCamera]);

  // --- FUNCIONES ---

  const handleDownload = (id) => {
    const downloadUrl = `http://localhost:3000/api/recordings/download/${id}`;
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta grabación permanentemente?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/recordings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRecordings(prev => prev.filter(rec => rec.recording_id !== id));
      alert('Grabación eliminada');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar');
    }
  };

  // Calcular espacio total usado
  const totalSize = recordings.reduce((acc, curr) => acc + (parseInt(curr.file_size_bytes) || 0), 0);
  const totalMB = (totalSize / 1024 / 1024).toFixed(2);

  // --- RENDER ---
  return (
    <div className="p-6 min-h-screen">
      
      {/* CABECERA Y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Galería de Grabaciones</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Almacenamiento visible: <span className="text-indigo-400 font-bold">{totalMB} MB</span>
          </p>
        </div>
        
        {/* Barra de Filtros */}
        <div className="flex flex-wrap gap-4 bg-gray-200 dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fecha</label>
            <input 
              type="date" 
              className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded p-1 text-sm border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cámara</label>
            <select 
              className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded text-sm border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none w-40 p-1.5"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              <option value="">Todas</option>
              {cameras.map(cam => (
                <option key={cam.camera_id} value={cam.camera_id}>{cam.name}</option>
              ))}
            </select>
          </div>
          
          {(selectedDate || selectedCamera) && (
            <button 
              onClick={() => { setSelectedDate(''); setSelectedCamera(''); }}
              className="self-end mb-1 text-xs text-indigo-400 hover:text-white underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      
      {/* MENSAJE SI ESTÁ VACÍO */}
      {recordings.length === 0 && (
        <div className="text-center py-20 bg-gray-300/50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No se encontraron grabaciones con estos filtros.</p>
        </div>
      )}

      {/* GRID DE VIDEOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map(rec => (
          <div 
            key={rec.recording_id} 
            className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-lg shadow-lg flex flex-col relative group"
          >
            
            {/* --- BOTONES FLOTANTES (Hover) --- */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              
              {/* Botón Recortar (Tijeras) */}
              <button 
                onClick={() => setTrimmingVideo(rec)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg"
                title="Recortar Clip"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-8.486a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243z" />
                </svg>
              </button>

              {/* Botón Eliminar (Solo Admin) */}
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(rec.recording_id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                  title="Eliminar grabación"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            {/* -------------------------------- */}

            <div className="flex justify-between items-start mb-2 pr-16">
              <h3 className="dark:text-white font-bold text-lg truncate" title={rec.camera_name}>{rec.camera_name}</h3>
            </div>

            <div className="flex justify-between items-center mb-2">
               <span className="text-xs bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded">
                {(rec.file_size_bytes / 1024 / 1024).toFixed(1)} MB
              </span>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {new Date(rec.start_time).toLocaleString()}
              </p>
            </div>
            
            {/* REPRODUCTOR */}
            <div className="bg-black rounded overflow-hidden aspect-video mb-4">
               <video 
                 controls 
                 className="w-full h-full object-contain"
                 src={`http://localhost:3000/videos/${rec.file_path}`} 
               />
            </div>

            {/* BOTÓN DESCARGAR */}
            <button
              onClick={() => handleDownload(rec.recording_id)}
              className="cursor-pointer mt-auto w-full bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors border dark:border-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Completo
            </button>

          </div>
        ))}
      </div>

      {/* --- MODAL DE RECORTE --- */}
      {trimmingVideo && (
        <TrimModal 
          recording={trimmingVideo} 
          onClose={() => setTrimmingVideo(null)} 
        />
      )}

    </div>
  );
}

export default RecordingsPage;