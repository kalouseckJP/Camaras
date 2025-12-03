import React, { useState } from 'react';
import api from '../../api/axios';

function TrimModal({ recording, onClose }) {
  // Estado para los inputs
  const [startTime, setStartTime] = useState('00:00:00'); // Formato HH:MM:SS
  const [duration, setDuration] = useState('30'); // Segundos
  const [loading, setLoading] = useState(false);

  const handleTrim = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Llamamos al endpoint que creamos (o crearemos) en el backend
      // NOTA: Axios con responseType: 'blob' es necesario para descargar archivos
      const response = await api.post(`/recordings/trim/${recording.recording_id}`, {
        start: startTime,
        duration: duration
      }, {
        responseType: 'blob' // ¡Importante para descargas!
      });

      // Truco para forzar la descarga del archivo que responde el servidor
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clip-${recording.camera_name}-${Date.now()}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      onClose(); // Cerrar modal al terminar
      alert('Clip descargado correctamente');

    } catch (error) {
      console.error(error);
      alert('Error al recortar el video. Verifica el formato de tiempo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-gray-200 dark:bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
          <h3 className="dark:text-white font-bold">Recortar Grabación</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Archivo original: <span className="font-bold dark:text-white">{recording.camera_name}</span>
          </p>

          {/* Vista previa pequeña (Opcional, ayuda a ver el tiempo) */}
          <video 
            src={`http://localhost:3000/videos/${recording.file_path}`} 
            controls 
            className="w-full rounded mb-6 bg-black h-48 object-contain"
          />

          <form onSubmit={handleTrim} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Input Inicio */}
              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Inicio (HH:MM:SS)</label>
                <input 
                  type="text" 
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                  placeholder="00:00:10"
                  className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded p-2 text-center font-mono"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              {/* Input Duración */}
              <div>
                <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Duración (Segundos)</label>
                <input 
                  type="number" 
                  min="1" max="300"
                  className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded p-2 text-center font-mono"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 dark:hover:text-white hover:text-black cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Procesando...' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-8.486a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243z" />
                    </svg>
                    Descargar Clip
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TrimModal;