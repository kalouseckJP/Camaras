import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function EditCamerasPages() {
  const navigate = useNavigate();

  const [cameras, setCameras] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar todas las cámaras
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/cameras', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCameras(res.data);
      } catch {
        alert('Error al cargar cámaras');
        navigate('/cameras');
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [navigate]);

  // 2. Selección
  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // 3. Edición de campos
  const updateCamera = (id, field, value) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.camera_id === id ? { ...cam, [field]: value } : cam
      )
    );
  };

  // 4. PUT reutilizando tu lógica
  const saveCamera = async (camera) => {
    const token = localStorage.getItem('token');
    return api.put(
      `/cameras/${camera.camera_id}`,
      {
        name: camera.name,
        ip: camera.ip_address,
        streamUrlMain: camera.stream_url_main,
        streamUrlSub: camera.stream_url_sub
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCameras = cameras.filter(cam =>
      selectedIds.includes(cam.camera_id)
    );

    if (selectedCameras.length === 0) {
      alert('Seleccione al menos una cámara');
      return;
    }

    try {
      await Promise.all(selectedCameras.map(saveCamera));
      alert('Cámaras actualizadas');
      navigate('/cameras');
    } catch {
      alert('Error al actualizar una o más cámaras');
    }
  };

  if (loading) {
    return <div className="p-8 dark:text-white">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className=" mx-auto mt-10 space-y-6 grid md:grid-cols-2 gap-2 bg-gray-200 dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-300">
      <h2 className="text-2xl dark:text-white font-semibold col-start-1 col-end-3">
        Editar Cámaras
      </h2>

      {cameras.map(camera => {
        const selected = selectedIds.includes(camera.camera_id);

        return (
          <div
            key={camera.camara_id}
            className={`p-6 rounded shadow border
              ${selected ? 'bg-gray-300 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-900 opacity-60'}`}
          >
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleSelection(camera.camera_id)}
              />
              <span className="dark:text-white font-medium">
                {camera.name} (ID {camera.camera_id})
              </span>
            </label>

            <fieldset disabled={!selected} className="space-y-3">
              <input
                className="w-full p-2 rounded border dark:bg-gray-700 bg-gray-200"
                value={camera.name}
                onChange={e => updateCamera(camera.camera_id, 'name', e.target.value)}
                placeholder="Nombre"
              />

              <input
                className="w-full p-2 rounded border dark:bg-gray-700 bg-gray-200"
                value={camera.ip_address || ''}
                onChange={e => updateCamera(camera.camera_id, 'ip_address', e.target.value)}
                placeholder="IP"
              />

              <input
                className="w-full p-2 rounded border dark:bg-gray-700 bg-gray-200"
                value={camera.stream_url_main}
                onChange={e => updateCamera(camera.camera_id, 'stream_url_main', e.target.value)}
                placeholder="Stream URL"
              />

              <input
                className="w-full p-2 rounded border dark:bg-gray-700 bg-gray-200"
                value={camera.stream_url_sub || ''}
                onChange={e => updateCamera(camera.camera_id, 'stream_url_sub', e.target.value)}
                placeholder="Sub-stream URL"
              />
            </fieldset>
          </div>
        );
      })}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/cameras')}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
