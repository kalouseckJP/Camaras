import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [stats, setStats] = useState({ usedBytes: 0, recordingCount: 0, cameraCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error cargando stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Función auxiliar para convertir bytes a GB/MB legibles
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <div className="text-white p-8">Calculando almacenamiento...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white mb-2">Panel de Control</h1>
      <p className="text-gray-700 dark:text-gray-400 mb-8">Resumen del estado del sistema</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- TARJETA 1: REPORTE DE ALMACENAMIENTO --- */}
        <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col items-center text-center">
          <div className="p-3 bg-indigo-900 rounded-full mb-4">
             {/* Icono Disco Duro */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
             </svg>
          </div>
          <h2 className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase">Almacenamiento Usado</h2>
          <p className="text-4xl font-extrabold dark:text-white mt-2">{formatBytes(stats.usedBytes)}</p>
          <p className="text-xs text-gray-700 dark:text-gray-500 mt-2">Total acumulado en grabaciones</p>
        </div>

        {/* --- TARJETA 2: GRABACIONES --- */}
        <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col items-center text-center">
           <div className="p-3 bg-green-900 rounded-full mb-4">
             {/* Icono Video */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>
           </div>
           <h2 className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase">Total Grabaciones</h2>
           <p className="text-4xl font-extrabold dark:text-white mt-2">{stats.recordingCount}</p>
           <Link to="/recordings" className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2">Ver Galería &rarr;</Link>
        </div>

        {/* --- TARJETA 3: CÁMARAS ACTIVAS --- */}
        <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col items-center text-center">
           <div className="p-3 bg-blue-900 rounded-full mb-4">
             {/* Icono Cámara */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
           </div>
           <h2 className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase">Cámaras Configuradas</h2>
           <p className="text-4xl font-extrabold dark:text-white mt-2">{stats.cameraCount}</p>
           <Link to="/live" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2">Ir a Vista en Vivo &rarr;</Link>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;