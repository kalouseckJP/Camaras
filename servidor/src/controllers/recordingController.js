const recordingService = require('../services/recordingService');
const db = require('../config/db'); // Para listar grabaciones
const path = require('path');
const fs = require('fs');

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

const downloadVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscar en la BDD el nombre del archivo usando el ID
    const query = 'SELECT file_path FROM "Recordings" WHERE recording_id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grabación no encontrada en base de datos' });
    }

    const filename = result.rows[0].file_path;
    const filePath = path.join(__dirname, '../../storage', filename);

    // 2. VERIFICACIÓN DE SEGURIDAD: ¿Existe el archivo físico?
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Archivo perdido: ${filename}`);
      return res.status(404).json({ 
        error: 'El archivo de video no existe en el disco (probablemente fue una grabación fallida antigua).' 
      });
    }

    // 2. Enviar el archivo al navegador forzando la descarga
    // res.download hace magia: confi gura los headers para que salga "Guardar como..."
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error al descargar:', err);
        // Si ya se enviaron headers, no podemos enviar otro error json
        if (!res.headersSent) {
          res.status(500).json({ error: 'El archivo físico no existe en el servidor' });
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = { start, stop, list, downloadVideo };