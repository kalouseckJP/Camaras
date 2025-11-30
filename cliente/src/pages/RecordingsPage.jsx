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

  return (
    <div className="p-6">
      <h1 className="text-2xl text-white mb-4">Grabaciones Guardadas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recordings.map(rec => (
          <div key={rec.recording_id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-bold">{rec.camera_name}</h3>
            <p className="text-gray-400 text-sm mb-2">
              {new Date(rec.start_time).toLocaleString()}
            </p>
            
            {/* Reproductor de Video Estándar */}
            <video 
              controls 
              className="w-full rounded bg-black"
              // Apuntamos a la carpeta estática que configuramos en server.js
              src={`http://localhost:3000/videos/${rec.file_path}`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
export default RecordingsPage;