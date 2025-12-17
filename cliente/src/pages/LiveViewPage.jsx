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
  const [connected, setConnected] = useState([
    {
      id: '',
      status: '',
    },
  ])

  const dragIndexRef = useRef(null)

  const [recordingCams, setRecordingCams] = useState({})

  // current stream URL per camera_id (main or sub)
  const [currentStreams, setCurrentStreams] = useState({})

  const toggleRecording = async (cam) => {
    const isRecording = recordingCams[cam.camera_id]
    const token = localStorage.getItem('token')

    try {
      if (isRecording) {
        // DETENER
        await api.post(
          '/recordings/stop',
          { cameraId: cam.camera_id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setRecordingCams((prev) => ({ ...prev, [cam.camera_id]: true }))
        alert('Grabación iniciada')
      }
    } catch (error) {
      console.error(error)
      alert('Error con la grabación')
    }
  }

  // --- 1. CARGA DE DATOS (Base de Datos + LocalStorage + USB) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Traer cámaras de la BD
        const token = localStorage.getItem('token')
        const response = await api.get('/cameras', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dbCameras = response.data

        // B. Crear objeto de Cámara USB (manual)
        const usbCamera = {
          camera_id: 'local-usb', // ID especial texto para diferenciarla
          name: 'Cámara USB (Local)',
          type: 'usb',
          current_status: 'online',
        }

        // C. Unir todo en una lista bruta
        // Ponemos la USB al principio o al final, como prefieras
        let fullList = [usbCamera, ...dbCameras]

        // D. Aplicar orden guardado en LocalStorage
        const savedOrder = localStorage.getItem('cameraOrder')
        if (savedOrder) {
          const orderIds = JSON.parse(savedOrder)

          // Ordenamos 'fullList' basándonos en el índice de sus IDs en 'orderIds'
          fullList.sort((a, b) => {
            const indexA = orderIds.indexOf(String(a.camera_id))
            const indexB = orderIds.indexOf(String(b.camera_id))

            // Si el ID no está en la lista guardada (es nuevo), va al final
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

    fetchData()
  }, [])

  useEffect(() => {
    ;(async () => {
      const result = await testConnection(cameras)
    })()
  }, [cameras])

  // --- 2. LÓGICA DE REORDENAMIENTO Y GUARDADO ---
  const saveOrder = (newList) => {
    // Guardamos solo los IDs en orden
    const orderIds = newList.map((c) => String(c.camera_id))
    localStorage.setItem('cameraOrder', JSON.stringify(orderIds))
  }

  const reorder = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return

    const copy = [...cameras]
    const [movedItem] = copy.splice(fromIndex, 1)
    copy.splice(toIndex, 0, movedItem)

    setCameras(copy)
    saveOrder(copy) // Guardamos el nuevo orden
  }

  // --- 3. LÓGICA VISUAL (LAYOUT Y FULLSCREEN) ---
  const getGridClass = () => {
    switch (gridCols) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 md:grid-cols-2' // Móvil 1, PC 2
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // Móvil 1, Tablet 2, PC 3
      case 4:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2'
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

  async function testConnection(cameras) {
    if (!cameras || cameras.length === 0) return

    const results = await Promise.all(
      cameras.map(async (cam) => {
        let isConnected = false

        // Example: test MJPEG HTTP stream
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 100000) // 3s timeout

          const img = new Image()
          const imgPromise = new Promise((resolve) => {
            img.onload = () => resolve(true)
            img.onerror = () => resolve(false)
          })
          img.src = cam.url + '?t=' + Date.now() // avoid cache

          isConnected = await Promise.race([
            imgPromise,
            new Promise((res) => setTimeout(() => res(false), 100000)),
          ])
          clearTimeout(timeout)
        } catch {
          isConnected = false
        }

        return {
          id: cam.camera_id,
          status: isConnected,
        }
      })
    )

    setConnected(results) // update state once with all results
    console.log(results)
  }

  const toggleStream = (_elementId, cam) => {
    // Toggle between main and sub (uses React state so UI/player updates)
    if (!cam) return
    setCurrentStreams((prev) => {
      const current =
        prev[cam.camera_id] ?? cam.stream_url_main ?? cam.stream_url_sub
      const newUrl =
        current === cam.stream_url_main
          ? cam.stream_url_sub || cam.stream_url_main
          : cam.stream_url_main
      return { ...prev, [cam.camera_id]: newUrl }
    })
  }

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full">
      {/* BARRA SUPERIOR: Título y Botones de Layout */}
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

            // Detectar tipo de stream
            const isUsb = cam.type === 'usb' || cam.camera_id === 'local-usb'
            // Lógica simple: si tiene m3u8 es HLS, si no, asumimos MJPEG (imagen)
            const isHls =
              cam.stream_url_main && cam.stream_url_main.includes('.m3u8')

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
                // Lógica Drag & Drop
                draggable
                onDragStart={(e) => {
                  dragIndexRef.current = idx
                  e.dataTransfer.setData('text/plain', String(idx))
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault() // Necesario para permitir soltar
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
                {/* Cabecera de la tarjeta (Nombre y estado) */}
                <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/30 dark:from-black/80 to-transparent p-2 z-10 flex justify-between items-start pointer-events-none">
                  <div className="pointer-events-auto">
                    {' '}
                    {/* Para permitir seleccionar texto si se quiere */}
                    <h3 className="text-white font-bold text-sm drop-shadow-md">
                      {cam.name}
                    </h3>
                    <span
                      className={`text-xs ${connected == 'online' ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {connected == 'online' ? '● En vivo' : '● Desconectado'}
                    </span>
                  </div>

                  {/* La intencion es que se pueda cambiar el stream de la camara a uno secundario */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStream(containerId, cam)
                    }}
                    className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-indigo-600 text-white p-1.5 rounded"
                    title="Pantalla Completa"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 23 23"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  </button>

                  <div className="pointer-events-auto ...">
                    {/* ... titulo ... */}

                    {/* BOTÓN GRABAR (Círculo rojo) */}
                    {!isUsb && ( // Solo mostrar si NO es USB
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRecording(cam)
                        }}
                        className={`ml-2 px-2 rounded text-xs font-bold ${
                          recordingCams[cam.camera_id]
                            ? 'bg-red-600 text-white animate-pulse' // Parpadea si graba
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {recordingCams[cam.camera_id] ? 'REC ●' : 'GRABAR'}
                      </button>
                    )}
                  </div>

                  {/* Botón Fullscreen */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFullScreen(containerId)
                    }}
                    className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-indigo-600 text-white p-1.5 rounded"
                    title="Pantalla Completa"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  </button>
                </div>

                {/* Contenido del Video */}
                <div className="flex-1 relative min-h-[200px] bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  {isUsb ? (
                    <USBCameraView />
                  ) : isHls ? (
                    <CameraView
                      key={currentStreams[cam.camera_id] ?? cam.stream_url_main}
                      streamUrl={
                        currentStreams[cam.camera_id] ?? cam.stream_url_main
                      }
                    />
                  ) : (
                    /* MJPEG / Imagen Estática */
                    <img
                      src={currentStreams[cam.camera_id] ?? cam.stream_url_sub}
                      alt={cam.name}
                      className="w-full h-full object-contain absolute inset-0"
                      onError={(e) => {
                        e.target.style.display = 'none' // Ocultar si falla
                      }}
                      onLoad={(e) => (e.target.style.display = 'block')}
                    />
                  )}

                  {/* Placeholder si falla la imagen o video */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <span className="text-gray-600 text-sm">
                      Cargando señal...
                    </span>
                  </div>
                </div>
                
								<div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/30 dark:from-black/50 to-transparent p-2 z-10 flex justify-between items-start">
                  <PTZButton/>
								</div>
              </div>
            )
          })}

          {/* Mensaje si no hay cámaras */}
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
