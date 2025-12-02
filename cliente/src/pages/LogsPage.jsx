import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (error) {
        console.error("Error cargando logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 dark:text-white">Cargando auditoría...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white mb-6">Auditoría de Accesos</h1>

      <div className="bg-gray-200 dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-300 dark:bg-gray-900 border-b dark:border-gray-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fecha</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Usuario</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acción</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Objetivo (ID)</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Dirección IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.log_id} className="hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors border-b border-gray-300 dark:border-gray-700">
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {/* Usamos log.timestamp que es tu columna */}
                  {new Date(log.timestamp).toLocaleString()} 
                </td>
                <td className="px-5 py-3 text-sm font-bold dark:text-white">
                  {log.username}
                </td>
                <td className="px-5 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    log.action === 'LOGIN' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {log.target_id || '-'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {log.ip_address || 'Desconocida'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-4 text-center dark:text-gray-500">No hay registros de actividad aún.</div>
        )}
      </div>
    </div>
  );
}

export default LogsPage;