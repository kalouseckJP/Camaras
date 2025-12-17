import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import CameraView from '../features/CameraView'
import USBCameraView from '../features/USBCameraView'
import PTZButton from '../features/PTZButton'

function LiveViewPage() {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [gridCols, setGridCols] = useState(2) // Layout por defecto: 2 columnas
  const [selectedId, setSelectedId] = useState(null)
  
  // Ref para Drag & Drop
  const dragIndexRef = useRef(null)

  const [recordingCams, setRecordingCams] = useState({})

  // current stream URL per camera_id (main or sub)
  const [currentStreams, setCurrentStreams] = useState({})

  // --- ACCIONES DE GRABACIÓN ---
  const toggleRecording = async (cam) => {
    const isRecording = recordingCams[cam.camera_id]
    const token = localStorage.getItem('token')

    try {
      if (isRecording) {
        // DETENER
        await api.post(
          '/recordings/stop',
          { cameraId: cam.camera_id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setRecordingCams((prev) => ({ ...prev, [cam.camera_id]: false }))
        alert('Grabación detenida')
      } else {
        // INICIAR
        await api.post(
          '/recordings/start',
          {
            cameraId: cam.camera_id,
            streamUrl: cam.stream_url_main,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setRecordingCams((prev) => ({ ...prev, [cam.camera_id]: true }))
        alert('Grabación iniciada')
      }
    } catch (error) {
      console.error(error)
      alert('Error con la grabación')
    }
  }

  // --- 1. CARGA DE DATOS (POLLING AUTOMÁTICO PARA EL PING) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // A. Traer cámaras de la BD (Ahora incluye is_online y last_checked)
        const response = await api.get('/cameras', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dbCameras = response.data

        // B. Crear objeto de Cámara USB (manual)
        const usbCamera = {
          camera_id: 'local-usb',
          name: 'Cámara USB (Local)',
          type: 'usb',
          is_online: true, // La USB local asumimos que siempre está conectada si el navegador la ve
          last_checked: new Date(),
        }

        // C. Unir todo
        let fullList = [usbCamera, ...dbCameras]

        // D. Aplicar orden guardado en LocalStorage
        const savedOrder = localStorage.getItem('cameraOrder')
        if (savedOrder) {
          const orderIds = JSON.parse(savedOrder)
          fullList.sort((a, b) => {
            const indexA = orderIds.indexOf(String(a.camera_id))
            const indexB = orderIds.indexOf(String(b.camera_id))
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            return indexA - indexB
          })
        }

        setCameras(fullList)
      } catch (error) {
        console.error('Error cargando cámaras:', error)
      } finally {
        setLoading(false)
      }
    }

    // Cargar inmediatamente
    fetchData()

    // Configurar intervalo para refrescar el estado del Ping cada 10 segundos
    const intervalId = setInterval(fetchData, 10000)

    // Limpiar intervalo al salir
    return () => clearInterval(intervalId)
  }, [])


  // --- 2. LÓGICA DE REORDENAMIENTO Y GUARDADO ---
  const saveOrder = (newList) => {
    const orderIds = newList.map((c) => String(c.camera_id))
    localStorage.setItem('cameraOrder', JSON.stringify(orderIds))
  }

  const reorder = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return

    const copy = [...cameras]
    const [movedItem] = copy.splice(fromIndex, 1)
    copy.splice(toIndex, 0, movedItem)

    setCameras(copy)
    saveOrder(copy)
  }

  // --- 3. LÓGICA VISUAL ---
  const getGridClass = () => {
    switch (gridCols) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      default: return 'grid-cols-1 md:grid-cols-2'
    }
  }

  const toggleFullScreen = (elementId) => {
    const element = document.getElementById(elementId)
    if (element) {
      if (!document.fullscreenElement) {
        element.requestFullscreen().catch((err) => console.log(err))
      } else {
        document.exitFullscreen()
      }
    }
  }

  const toggleStream = (_elementId, cam) => {
    if (!cam) return
    setCurrentStreams((prev) => {
      const current = prev[cam.camera_id] ?? cam.stream_url_main ?? cam.stream_url_sub
      const newUrl = current === cam.stream_url_main
          ? cam.stream_url_sub || cam.stream_url_main
          : cam.stream_url_main
      return { ...prev, [cam.camera_id]: newUrl }
    })
  }

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full">
      {/* BARRA SUPERIOR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 bg-gray-200 dark:bg-gray-800 p-3 rounded-lg shadow">
        <div>
          <h1 className="text-xl font-bold dark:text-white">
            Centro de Monitoreo
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Arrastra las cámaras para organizar
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">
            Vistas:
          </span>
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setGridCols(num)}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                gridCols === num
                  ? 'bg-indigo-400 dark:bg-indigo-600 text-white hover:bg-indigo-500 dark:hover:bg-indigo-700'
                  : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {num}x{num}
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DE CÁMARAS */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-white">
          Cargando sistema...
        </div>
      ) : (
        <div className={`grid ${getGridClass()} gap-4 auto-rows-fr pb-10`}>
          {cameras.map((cam, idx) => {
            const isSelected = selectedId === cam.camera_id
            const containerId = `cam-container-${cam.camera_id}`
            
            // Lógica de Estado (Backend)
            // Si is_online es null (cámara nueva), asumimos true momentáneamente
            const isOnline = cam.type === 'usb' ? true : (cam.is_online !== false);
            
            const lastPingTime = cam.last_checked 
                ? new Date(cam.last_checked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                : '--:--';

            // Detectar tipo de stream
            const isUsb = cam.type === 'usb' || cam.camera_id === 'local-usb'
            const isHls = !isUsb && (currentStreams[cam.camera_id] || cam.stream_url_main || '').includes('.m3u8')

            return (
              <div
                key={cam.camera_id}
                id={containerId}
                className={`
                  relative group flex flex-col
                  bg-black rounded-lg shadow-lg overflow-hidden 
                  border transition-all duration-200
                  ${isSelected ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-700'}
                `}
                draggable
                onDragStart={(e) => {
                  dragIndexRef.current = idx
                  e.dataTransfer.setData('text/plain', String(idx))
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const from = Number(e.dataTransfer.getData('text/plain'))
                  reorder(from, idx)
                  dragIndexRef.current = null
                }}
                onClick={() => setSelectedId(cam.camera_id)}
              >
                {/* --- HEADER VISUAL MEJORADO --- */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-2 z-20 flex justify-between items-start pointer-events-none h-16">
                  
                  {/* Lado Izquierdo: Estado Visual y Nombre */}
                  <div className="pointer-events-auto flex items-center gap-2">
                    <div className="flex flex-col items-center pt-1">
                       <div 
                         className={`w-3 h-3 rounded-full border border-white/20 shadow-lg ${
                           isOnline 
                             ? 'bg-green-500 shadow-green-500/50' 
                             : 'bg-red-600 shadow-red-600/50 animate-pulse'
                         }`} 
                         title={isOnline ? "En Línea" : "Sin Conexión"}
                       />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm drop-shadow-md leading-tight">
                        {cam.name}
                      </h3>
                      <p className={`text-[10px] font-mono mt-0.5 ${isOnline ? 'text-green-400/80' : 'text-red-400'}`}>
                        {isOnline ? `● ONLINE ${lastPingTime}` : `● OFFLINE ${lastPingTime}`}
                      </p>
                    </div>
                  </div>

                  {/* Lado Derecho: Botones de control */}
                  <div className="flex items-center gap-1 pointer-events-auto">
                    
                    {/* Switch Stream */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStream(containerId, cam)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-indigo-600 text-white p-1.5 rounded backdrop-blur-sm"
                      title="Cambiar Stream"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>

                    {/* Botón Grabar */}
                    {!isUsb && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRecording(cam)
                        }}
                        className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          recordingCams[cam.camera_id]
                            ? 'bg-red-600/80 border-red-500 text-white animate-pulse'
                            : 'bg-gray-800/60 border-gray-600 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {recordingCams[cam.camera_id] ? 'REC' : 'REC'}
                      </button>
                    )}

                    {/* Botón Fullscreen */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFullScreen(containerId)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-indigo-600 text-white p-1.5 rounded backdrop-blur-sm ml-1"
                      title="Pantalla Completa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* --- ÁREA DE VIDEO --- */}
                <div className="flex-1 relative min-h-[200px] bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  
                  {isUsb ? (
                    <USBCameraView />
                  ) : isHls ? (
                    <CameraView
                      key={currentStreams[cam.camera_id] ?? cam.stream_url_main}
                      streamUrl={currentStreams[cam.camera_id] ?? cam.stream_url_main}
                    />
                  ) : (
                    <img
                      src={currentStreams[cam.camera_id] ?? cam.stream_url_sub}
                      alt={cam.name}
                      className="w-full h-full object-contain absolute inset-0"
                      onError={(e) => { e.target.style.display = 'none' }}
                      onLoad={(e) => (e.target.style.display = 'block')}
                    />
                  )}

                  {/* CAPA OFFLINE (Nuevo) */}
                  {!isOnline && (
                    <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                        <p className="text-red-400 font-bold text-sm tracking-widest uppercase">Sin Señal</p>
                        <p className="text-gray-500 text-xs mt-1">Último contacto: {lastPingTime}</p>
                    </div>
                  )}

                  {/* Loader Fondo */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <span className="text-gray-600 text-sm">Cargando señal...</span>
                  </div>
                </div>
                
                {/* Footer PTZ */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 z-10 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
                  <PTZButton/>
                </div>
              </div>
            )
          })}

          {/* Mensaje vacío */}
          {cameras.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg text-gray-500">
              <p>No hay cámaras configuradas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LiveViewPage