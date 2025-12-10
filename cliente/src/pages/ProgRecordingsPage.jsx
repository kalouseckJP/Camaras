import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

function ProgRecordingsPage() {
  const { isAdmin } = useAuth()

  return (
    <div className="p-6 min-h-screen">
      <div className="flex flex-wrap gap-4 bg-gray-200 dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700 w-full md:w-auto">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Fecha
          </label>
          <input
            type="date"
            className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded p-1 text-sm border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Cámara
          </label>
          <select
            className="bg-gray-100 dark:bg-gray-700 dark:text-white rounded text-sm border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none w-40 p-1.5"
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
          >
            <option value="">Todas</option>
            {cameras.map((cam) => (
              <option key={cam.camera_id} value={cam.camera_id}>
                {cam.name}
              </option>
            ))}
          </select>
        </div>

        {(selectedDate || selectedCamera) && (
          <button
            onClick={() => {
              setSelectedDate('')
              setSelectedCamera('')
            }}
            className="self-end mb-1 text-xs text-indigo-400 hover:text-white underline"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
export default ProgRecordingsPage
