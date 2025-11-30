const recordingService = require('../services/recordingService');
const db = require('../config/db'); // Para listar grabaciones

// Iniciar
const start = async (req, res) => {
  const { cameraId, streamUrl } = req.body;
  try {
    await recordingService.startRecording(cameraId, streamUrl);
    res.json({ message: 'Grabación iniciada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Detener
const stop = async (req, res) => {
  const { cameraId } = req.body;
  try {
    await recordingService.stopRecording(cameraId);
    res.json({ message: 'Grabación detenida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar historial
const list = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, c.name as camera_name 
      FROM "Recordings" r
      JOIN "Cameras" c ON r.camera_id = c.camera_id
      ORDER BY start_time DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error listando grabaciones' });
  }
};

module.exports = { start, stop, list };