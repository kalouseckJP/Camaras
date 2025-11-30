import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const fetchRecs = async () => {
      const token = localStorage.getItem('token');
      const res = await api.get('/recordings', {
         headers: { Authorization: `Bearer ${token}` }
      });
      setRecordings(res.data);
    };
    fetchRecs();
  }, []);

  // Función para descargar
  const handleDownload = (id, fileName) => {
    // Truco: Usamos la URL directa de nuestra API
    // No necesitamos Axios aquí porque el navegador maneja la descarga mejor directamente
    const downloadUrl = `http://localhost:3000/api/recordings/download/${id}`;
    
    // Abrimos en una "pestaña" que se cierra sola al descargar
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Galería de Grabaciones</h1>
      
      {recordings.length === 0 && (
        <p className="text-gray-400">No hay grabaciones disponibles.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map(rec => (
          <div key={rec.recording_id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg flex flex-col">
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold text-lg">{rec.camera_name}</h3>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {(rec.file_size_bytes / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-3">
              📅 {new Date(rec.start_time).toLocaleString()}
            </p>
            
            {/* Reproductor de Video (Vista previa) */}
            <div className="bg-black rounded overflow-hidden aspect-video mb-4">
               <video 
                 controls 
                 className="w-full h-full object-contain"
                 src={`http://localhost:3000/videos/${rec.file_path}`} 
               />
            </div>

            {/* Botón de Descargar */}
            <button
              onClick={() => handleDownload(rec.recording_id, rec.file_path)}
              className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
            >
              {/* Ícono de descarga SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar MP4
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default RecordingsPage;