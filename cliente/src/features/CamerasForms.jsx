import { useEffect, useState } from 'react'
import api from '../api/axios'
import { NavLink, useNavigate } from 'react-router-dom'

export default function MultiCameras() {
  const [cameraName, setCameraName] = useState([])
  const [streamUrlMain, setStreamUrlMain] = useState([])
  const [streamUrlSub, setStreamUrlSub] = useState('')
  const [ipAddress, setIpAddress] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [enableTimestamp, setEnableTimestamp] = useState(true)
  const [enableMask, setEnableMask] = useState(true)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. Obtenemos el token del localStorage (para el middleware)
    const token = localStorage.getItem('token')

    // 2. Hacemos la petición POST
    streamUrlMain.map(async (ip,index) => {
      try {
        await api.post(
          '/cameras',
          {
            name: cameraName + ` ${index+1}`,
            ip: ipAddress + ` ${index+1}`,
            streamUrlMain: ip,
            streamUrlSub: streamUrlSub[index] ?? '',
          },
          {
            headers: { Authorization: `Bearer ${token}` }, // Enviamos el token
          }
        )
        alert('Cámara guardada exitosamente')
        // Redirigimos a la vista en vivo o lista de cámaras
        navigate('/live')
      } catch (error) {
        console.error('Error al guardar:', error)
        alert('Error al guardar la cámara')
      } finally {
        setLoading(false)
      }
    })
  }
  /**
   * Separa el texto por comas y las elimina.
   * @param {string} ip IPs
   * @returns {[string]} Arrays de IPs
   */
  function ipSeparation(ip) {
    let ips = ip.replaceAll(' ', '')
    ips = ip.replaceAll('\n', '')
    ips = ips.split(',')
    return ips
  }

  /**
   *
   * @param {string} ip IPs
   */
  function mainURL(ip) {
    setStreamUrlMain((prev) => {
      prev = ipSeparation(ip)
      return prev
    })
  }

  function subURL(ip) {
    setStreamUrlSub((prev) => {
      prev = ipSeparation(ip)
      return prev
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 max-w-2xl mx-auto"
    >
      <div className="flex justify-between">
        <NavLink
          to={'/agregar'}
          className="dark:text-white text-2xl mb-6 font-semibold rounded-md bg-indigo-300 p-1.5 hover:bg-indigo-400"
        >
          Registrar Nueva Cámara
        </NavLink>
        <h2 className="dark:text-white text-2xl mb-6 font-semibold">
          Multiples
        </h2>
      </div>
      {/* Nombre */}
      <div className="mb-4">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">
          Nombre Referencial
        </label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-indigo-500"
          placeholder="Ej: Cámara Entrada"
          value={cameraName}
          onChange={(e) => setCameraName(e.target.value)}
          required
        />
      </div>

      {/* IP */}
      <div className="mb-4">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">
          Dirección IP (Opcional)
        </label>
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-indigo-500"
          placeholder="Ej: 192.168.1.50"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
        />
      </div>

      {/* Stream URL */}

      <div className="mb-6">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">
          URL del Stream (MJPEG/HLS/RTSP)
        </label>
        <textarea
          name="mainStreams"
          id="mainStreams"
          placeholder="Ej: http://192.168.1.50:8081/stream, http://192.168.1.51:8081/stream"
          className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-indigo-500"
          value={streamUrlMain}
          onChange={(e) => mainURL(e.target.value)}
          required
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">
          Esta es la URL que usará el sistema para visualizar el video.
        </p>
      </div>

      <div className="mb-6">
        <label className="block dark:text-gray-300 text-sm font-bold mb-2">
          URL Secundaria del Stream (MJPEG/HLS/RTSP)
        </label>
        <textarea
          name="subStreams"
          id="subStreams"
          placeholder="Ej: http://192.168.1.50:8081/stream, http://192.168.1.51:8081/stream"
          className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-indigo-500"
          value={streamUrlSub}
          onChange={(e) => subURL(e.target.value)}
          required
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">Segunda URL.</p>
      </div>

      <div className="border-t border-gray-700 pt-4 mt-4">
        <h3 className="dark:text-gray-300 font-bold mb-3">
          Configuración de Video
        </h3>

        {/* Checkbox Timestamp */}
        <div className="flex items-center mb-4">
          <input
            id="ts-check"
            type="checkbox"
            className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded cursor-pointer"
            checked={enableTimestamp}
            onChange={(e) => setEnableTimestamp(e.target.checked)}
          />
          <label htmlFor="ts-check" className="ml-2 text-sm dark:text-gray-300">
            Superponer Fecha y Hora (Timestamp) en grabaciones
          </label>
        </div>

        {/* Checkbox Privacidad */}
        <div className="flex items-center">
          <input
            id="mask-check"
            type="checkbox"
            className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded cursor-pointer"
            checked={enableMask}
            onChange={(e) => setEnableMask(e.target.checked)}
          />
          <label
            htmlFor="mask-check"
            className="ml-2 text-sm dark:text-gray-300"
          >
            Activar Máscara de Privacidad (Censura estática)
          </label>
        </div>
        <p className="text-xs text-gray-500 ml-6 mt-1">
          Esto dibujará un recuadro negro en las grabaciones para tapar zonas
          sensibles.
        </p>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`cursor-pointer bg-indigo-400 dark:bg-indigo-600 text-gray-800 dark:text-white font-bold py-2 px-6 rounded hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Guardando...' : 'Guardar Cámara'}
        </button>
      </div>
    </form>
  )
}
