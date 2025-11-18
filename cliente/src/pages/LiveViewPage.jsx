import React from 'react';
// Importamos el componente de stream HLS
import CameraView from '../features/CameraView';
// ¡Importamos nuestro nuevo componente de cámara USB!
import USBCameraView from '../features/USBCameraView';

// URL de HLS de prueba
const TEST_STREAM_URL = 'http://192.168.1.23:8080';
const MJPEG_CAM_URL = 'http://10.0.21.65:8081/video.mjpg';

function LiveViewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">
        Vista en Vivo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Cámara 1: Cámara USB Local */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-3">
            <h3 className="text-white font-semibold">Cámara USB (Mi PC)</h3>
          </div>
          <USBCameraView />
        </div>

        {/* Cámara 2: Stream de Red (HLS) */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-3">
            <h3 className="text-white font-semibold">Cámara Taller (Yawcam)</h3>
          </div>
          {/* Usamos un <div> para mantener la proporción y un <img> adentro */}
          <div className="aspect-video w-full h-full bg-black">
            <img
              src={MJPEG_CAM_URL}
              alt="Cámara MJPEG"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Error al cargar stream MJPEG:', e);
                // Opcional: mostrar una imagen de "error"
                // e.target.src = '/camara-error.png'; 
              }}
            />
          </div>
        </div>

        {/* Cámara 3: Sin señal */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-3">
            <h3 className="text-white font-semibold">Cámara 3: Patio</h3>
          </div>
          
          <div className="aspect-video w-full h-full bg-black">

            <img
              src={TEST_STREAM_URL}
              className="w-full h-full object-cover"
              alt="Linux Camera"
            />
          </div>
          
          {/* <CameraView streamUrl={TEST_STREAM_URL} /> */}
        </div>

      </div>
    </div>
  );
}

export default LiveViewPage;