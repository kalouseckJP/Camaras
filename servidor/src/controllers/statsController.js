// src/controllers/statsController.js
const db = require('../config/db');

const getSummary = async (req, res) => {
  try {
    // Esta consulta hace todo el trabajo duro:
    // 1. SUM(file_size_bytes): Suma el peso de todos los archivos
    // 2. COUNT(*): Cuenta cuántas grabaciones hay
    // 3. (SELECT COUNT(*) FROM "Cameras"): Cuenta cuántas cámaras hay
    const query = `
      SELECT 
        SUM(file_size_bytes) as total_bytes,
        COUNT(*) as total_recordings,
        (SELECT COUNT(*) FROM "Cameras") as total_cameras
      FROM "Recordings";
    `;

    const result = await db.query(query);
    const data = result.rows[0];

    res.json({
      // Postgres devuelve SUM como string si es muy grande, lo convertimos a número
      usedBytes: parseInt(data.total_bytes) || 0,
      recordingCount: parseInt(data.total_recordings) || 0,
      cameraCount: parseInt(data.total_cameras) || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = { getSummary };