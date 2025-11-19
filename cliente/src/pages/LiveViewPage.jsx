import React, { useEffect, useState, useRef } from 'react';
// Importamos el componente de stream HLS
import CameraView from '../features/CameraView';
// ¡Importamos nuestro nuevo componente de cámara USB!
import USBCameraView from '../features/USBCameraView';

// URL de HLS de prueba
const TEST_STREAM_URL = 'http://192.168.1.23:8080';
const MJPEG_CAM_URL = 'http://10.0.21.65:8081/video.mjpg';

// Cámaras por defecto (ahora forman parte de la lista que se puede seleccionar/reordenar)
const DEFAULT_CAMERAS = [
  { id: 'usb-default', type: 'usb', name: 'Cámara USB (Mi PC)', isDefault: true },
  { id: 'mjpeg-default', type: 'mjpeg', name: 'Cámara Taller (Yawcam)', ip: MJPEG_CAM_URL, isDefault: true },
  { id: 'patio-default', type: 'stream', name: 'Cámara 3: Patio', ip: TEST_STREAM_URL, isDefault: true },
];

function LiveViewPage() {
  const [cameras, setCameras] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const dragIndexRef = useRef(null);

  const saveCameras = (list) => {
    try {
      localStorage.setItem('cameras', JSON.stringify(list));
      // notificar otras partes de la app
      window.dispatchEvent(new Event('camerasUpdated'));
    } catch (err) {
      console.error('Error guardando cámaras en localStorage', err);
    }
  };

  const loadCameras = () => {
    try {
      const raw = localStorage.getItem('cameras');
      const parsed = raw ? JSON.parse(raw) : null;

      // Compatibilidad:
      // - Si no hay nada guardado -> usar DEFAULT_CAMERAS
      // - Si hay guardado pero no contiene las cámaras por defecto (legacy), las añadimos al inicio
      // - Si ya hay una lista guardada que incluye defaults, la usamos tal cual
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
        setCameras(DEFAULT_CAMERAS);
      } else {
        const defaultIds = DEFAULT_CAMERAS.map(d => d.id);
        const hasDefault = parsed.some(p => defaultIds.includes(p.id));
        if (!hasDefault) {
          setCameras([...DEFAULT_CAMERAS, ...parsed]);
        } else {
          setCameras(parsed);
        }
      }
    } catch (err) {
      console.error('Error cargando cámaras desde localStorage', err);
      setCameras(DEFAULT_CAMERAS);
    }
  };

  useEffect(() => {
    loadCameras();
    const handler = () => loadCameras();
    window.addEventListener('camerasUpdated', handler);
    // también escuchar cambios de storage (otras pestañas)
    const storageHandler = (e) => {
      if (e.key === 'cameras') loadCameras();
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('camerasUpdated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  // Reordenar por índices
  const reorder = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    const copy = [...cameras];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setCameras(copy);
    saveCameras(copy);
  };

  // mover seleccionado arriba/abajo (útil en teclado o botones)
  const moveSelected = (direction) => {
    if (selectedId == null) return;
    const index = cameras.findIndex((c) => c.id === selectedId);
    if (index === -1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= cameras.length) return;
    reorder(index, target);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">
        Vista en Vivo
      </h1>

      <p className="text-sm text-gray-300 mb-4">
        Selecciona una cámara (clic) y arrástrala para reordenar. También puedes usar los botones Arriba/Abajo en la tarjeta seleccionada.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Renderizamos todas las cámaras (incluidas las por defecto) desde el estado */}
        {cameras.map((cam, idx) => {
          const isSelected = selectedId === cam.id;
          return (
            <div
              key={cam.id ?? `cam-${idx}`}
              className={`bg-gray-800 rounded-lg shadow-lg border overflow-hidden ${isSelected ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-700'}`}
              draggable
              onDragStart={(e) => {
                dragIndexRef.current = idx;
                // transferir índice como string
                e.dataTransfer.setData('text/plain', String(idx));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData('text/plain'));
                const to = idx;
                reorder(from, to);
                dragIndexRef.current = null;
              }}
              onClick={() => {
                setSelectedId(cam.id ?? null);
              }}
            >
              <div className="p-3 flex items-center justify-between">
                <h3 className="text-white font-semibold">{cam.name || cam.ip}</h3>
                {/* Controles simples visibles sólo si está seleccionada */}
                {isSelected && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSelected('up');
                      }}
                      className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSelected('down');
                      }}
                      className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>

              {/* Render según tipo */}
              {cam.type === 'usb' ? (
                <div className="bg-black">
                  <USBCameraView />
                </div>
              ) : cam.type === 'mjpeg' || (typeof cam.ip === 'string' && (cam.ip.includes('.mjpg') || cam.ip.toLowerCase().includes('mjpeg'))) ? (
                <div className="aspect-video w-full h-full bg-black">
                  <img
                    src={cam.ip || MJPEG_CAM_URL}
                    alt={cam.name || 'Cámara MJPEG'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error al cargar stream MJPEG:', e);
                    }}
                  />
                </div>
              ) : (
                <CameraView streamUrl={cam.ip || TEST_STREAM_URL} />
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default LiveViewPage;