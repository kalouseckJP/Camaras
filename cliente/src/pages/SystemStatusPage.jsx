import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function SystemStatusPage() {
  const [alerts, setAlerts] = useState([]);
  
  // Inicializamos con tus claves por defecto para que no falle el render
  const [settings, setSettings] = useState({ 
    storage_retention_days: '', 
    backup_path: '',
    smtp_host: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. CARGAR DATOS REALES
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Hacemos las dos peticiones en paralelo
        const [resAlerts, resSettings] = await Promise.all([
          api.get('/alerts', { headers }),
          api.get('/settings', { headers })
        ]);

        setAlerts(resAlerts.data);
        setSettings(resSettings.data);
        
      } catch (e) { 
        console.error("Error cargando sistema:", e); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. GUARDAR CAMBIOS
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // 3. RENDER
  if (loading) return <div className="p-8 dark:text-white">Cargando estado del sistema...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white mb-6">Estado del Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ALERTAS */}
        <div className="bg-gray-300 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 h-fit">
          <h2 className="text-xl dark:text-white font-bold mb-4 flex items-center gap-2">
            🔔 Alertas del Sistema
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">Sin alertas recientes.</p>
            ) : alerts.map(alert => (
              <div key={alert.alert_id} className={`p-3 rounded border-l-4 text-sm ${
                alert.type === 'ERROR' ? 'bg-red-900/20 border-red-500 dark:text-red-200' : 'bg-blue-900/20 border-blue-500 text-blue-200'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold">{alert.type}</span>
                  <span className="text-xs opacity-70">{new Date(alert.created_at).toLocaleString()}</span>
                </div>
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="dark:bg-gray-800 bg-gray-300 p-6 rounded-lg border dark:border-gray-700">
          <h2 className="text-xl dark:text-white font-bold mb-4 flex items-center gap-2">
            ⚙️ Configuración General
          </h2>
          
          <div className="space-y-4">
            {/* Retención */}
            <div>
               <label className="block dark:text-gray-400 text-sm mb-1">Días de Retención (Limpieza automática)</label>
               <input 
                 type="number" 
                 className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white rounded p-2 border border-gray-600 focus:border-indigo-500 outline-none" 
                 value={settings.storage_retention_days || ''} 
                 onChange={(e) => setSettings({...settings, storage_retention_days: e.target.value})} 
               />
            </div>

            {/* Backup Path */}
            <div>
               <label className="block dark:text-gray-400 text-sm mb-1">Ruta de Backup (NAS / Disco Externo)</label>
               <input 
                 type="text" 
                 className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-500 rounded p-2 border border-gray-600 focus:border-indigo-500 outline-none font-mono text-sm" 
                 value={settings.backup_path || ''} 
                 onChange={(e) => setSettings({...settings, backup_path: e.target.value})} 
               />
               <p className="text-xs text-gray-500 mt-1">Ej: /mnt/backup_nas/ o D:/Backups</p>
            </div>

            {/* SMTP Host (Extra que mencionaste) */}
            <div>
               <label className="block dark:text-gray-400 text-sm mb-1">Servidor SMTP (Alertas por correo)</label>
               <input 
                 type="text" 
                 className="w-full bg-gray-100 dark:bg-gray-700  dark:text-white text-gray-500 rounded p-2 border border-gray-600 focus:border-indigo-500 outline-none" 
                 value={settings.smtp_host || ''} 
                 onChange={(e) => setSettings({...settings, smtp_host: e.target.value})} 
               />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className={`mt-6 w-full py-2 rounded font-bold text-white transition-colors ${
              saving ? 'bg-indigo-800 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default SystemStatusPage;