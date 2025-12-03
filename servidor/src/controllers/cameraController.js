// src/controllers/cameraController.js
const Camera = require('../models/Camera');

const addCamera = async (req, res) => {
  try {
    // Recibimos los datos del formulario de React
    const { name, ip, streamUrlMain, streamUrlSub } = req.body;

    if (!name || !streamUrlMain) {
      return res.status(400).json({ error: 'Nombre y URL del stream son obligatorios' });
    }

    const newCamera = await Camera.create({
      name,
      ip_address: ip,
      stream_url_main: streamUrlMain,
      stream_url_sub: streamUrlSub // Opcional por ahora
    });

    res.status(201).json({ message: 'Cámara creada', camera: newCamera });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar la cámara' });
  }
};

const getAllCameras = async (req, res) => {
  try {
    const cameras = await Camera.findAll();
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cámaras' });
  }
};

const updateCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ip, streamUrlMain, streamUrlSub } = req.body;
    
    const updatedCamera = await Camera.update(id, {
      name, 
      ip_address: ip, 
      stream_url_main: streamUrlMain,
      stream_url_sub: streamUrlSub
    });

  if (!updatedCamera) return res.status(404).json({ error: 'Cámara no encontrada' });
    res.json({ message: 'Cámara actualizada', camera: updatedCamera });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

const deleteCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Camera.delete(id);
    
    if (!deleted) return res.status(404).json({ error: 'Cámara no encontrada' });
    
    res.json({ message: 'Cámara eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

const getCameraById = async (req, res) => {
  try {
    const { id } = req.params;
    const camera = await Camera.findById(id);
    
    if (!camera) return res.status(404).json({ error: 'Cámara no encontrada' });
    
    res.json(camera);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cámara' });
  }
};

module.exports = { addCamera, getAllCameras, updateCamera, deleteCamera, getCameraById };