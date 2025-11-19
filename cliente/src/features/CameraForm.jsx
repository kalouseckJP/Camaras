import React, { useState } from 'react';

function CameraForm() {
  const [ipAddress, setIpAddress] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'testing', 'success', 'error'

  const handleTestConnection = () => {
    // Simular una prueba de conexión
    setConnectionStatus('testing');
    setTimeout(() => {
      // Simular éxito (en un caso real, esto vendría de una API)
      if (ipAddress.length > 8) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (connectionStatus !== 'success') {
      alert('Por favor, prueba la conexión antes de guardar.');
      return;
    }

    // Crear objeto cámara
    const newCamera = {
      id: Date.now(),
      name: cameraName || `Camara ${ipAddress}`,
      ip: ipAddress.trim(),
    };

    // Leer cámaras existentes desde localStorage
    let cameras = [];
    try {
      const raw = localStorage.getItem('cameras');
      cameras = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Error parseando cameras desde localStorage', err);
      cameras = [];
    }

    // Añadir y guardar
    cameras.push(newCamera);
    localStorage.setItem('cameras', JSON.stringify(cameras));

    // Notificar a otras pestañas/componentes que la lista cambió
    window.dispatchEvent(new Event('camerasUpdated'));

    alert(`Cámara "${newCamera.name}" con IP ${newCamera.ip} guardada.`);

    // Limpiar formulario
    setIpAddress('');
    setCameraName('');
    setConnectionStatus(null);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700"
    >
      {/* Nombre de la Cámara */}
      <div className="mb-4">
        <label htmlFor="cameraName" className="block text-gray-300 text-sm font-bold mb-2">
          Nombre de la Cámara
        </label>
        <input
          type="text" id="cameraName"
          className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 ... bg-gray-700"
          value={cameraName}
          onChange={(e) => setCameraName(e.target.value)}
          required
        />
      </div>

      {/* IP de la Cámara */}
      <div className="mb-6">
        <label htmlFor="ipAddress" className="block text-gray-300 text-sm font-bold mb-2">
          Dirección IP (o URL del stream)
        </label>
        <div className="flex space-x-2">
          <input
            type="text" id="ipAddress"
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 ... bg-gray-700"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={connectionStatus === 'testing'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {connectionStatus === 'testing' ? 'Probando...' : 'Probar'}
          </button>
        </div>
      </div>

      {/* Indicador de Estado de Conexión (Previsualizar) */}
      {connectionStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-800 text-green-200 border border-green-600 rounded">
          ¡Conexión exitosa! Ya puedes guardar.
        </div>
      )}
      {connectionStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-800 text-red-200 border border-red-600 rounded">
          No se pudo conectar. Verifica la IP.
        </div>
      )}

      {/* Botón Guardar */}
      <div className="flex items-center justify-end">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded ..."
          type="submit"
          disabled={connectionStatus !== 'success'} // Solo se puede guardar si la conexión fue exitosa
        >
          Guardar Cámara
        </button>
      </div>
    </form>
  );
}

export default CameraForm;