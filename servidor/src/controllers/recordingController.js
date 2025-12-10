const recordingService = require('../services/recordingService');
const db = require('../config/db'); // Para listar grabaciones
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

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
    const { start_time, cameraId } = req.query;

    let query = `
      SELECT r.*, c.name as camera_name 
      FROM "Recordings" r
      JOIN "Cameras" c ON r.camera_id = c.camera_id
    `;
    
    const conditions = [];
    const values = [];

    if (start_time) {
      values.push(start_time);
      conditions.push(`CAST(r.start_time AS DATE) = $${values.length}`);
    }

    if (cameraId) {
      values.push(cameraId);
      conditions.push(`r.camera_id = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY r.start_time DESC";

    const result = await db.query(query, values);
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
const deleteRecording = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener el nombre del archivo antes de borrar el registro
    const queryFind = 'SELECT file_path FROM "Recordings" WHERE recording_id = $1';
    const result = await db.query(queryFind, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grabación no encontrada' });
    }

    const filename = result.rows[0].file_path;
    const filePath = path.join(__dirname, '../../storage', filename);

    // 2. Borrar archivo físico (si existe)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath); // Borrado físico
        console.log(`🗑️ Archivo borrado: ${filename}`);
      } catch (err) {
        console.error('Error borrando archivo físico:', err);
        // No detenemos el proceso, queremos borrar el registro de BD de todos modos
      }
    } else {
      console.warn('⚠️ El archivo físico no existía, borrando solo de BD.');
    }

    // 3. Borrar registro de la Base de Datos
    await db.query('DELETE FROM "Recordings" WHERE recording_id = $1', [id]);

    res.json({ message: 'Grabación eliminada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar grabación' });
  }
};
const trimVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, duration } = req.body; // Ej: start="00:00:10", duration="30"

    // A. Buscar el nombre del archivo en la BD
    const query = 'SELECT file_path, camera_id FROM "Recordings" WHERE recording_id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grabación no encontrada' });
    }

    const originalFilename = result.rows[0].file_path;
    const inputPath = path.join(__dirname, '../../storage', originalFilename);
    const outputFilename = `clip-${Date.now()}-${originalFilename}`;
    const outputPath = path.join(__dirname, '../../storage', outputFilename);

    // B. Verificar que el archivo original exista
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'El archivo de video original no existe en disco' });
    }

    console.log(`✂️ Recortando video: ${originalFilename} (Inicio: ${start}, Duración: ${duration}s)`);

    // C. Ejecutar FFmpeg para cortar
    ffmpeg(inputPath)
      .setStartTime(start)
      .setDuration(duration)
      .output(outputPath)
      .videoCodec('copy') // Copia exacta (muy rápido, sin perder calidad)
      .audioCodec('copy')
      .on('end', () => {
        console.log('✅ Recorte finalizado. Enviando archivo...');
        
        // D. Enviar el archivo al navegador
        res.download(outputPath, outputFilename, (err) => {
          // E. Borrar el clip temporal después de enviar (limpieza)
          if (!err) {
             try {
               fs.unlinkSync(outputPath);
             } catch (e) { console.error('Error borrando clip temporal:', e); }
          }
        });
      })
      .on('error', (err) => {
        console.error('❌ Error al recortar:', err);
        if (!res.headersSent) {
           res.status(500).json({ error: 'Error procesando el video' });
        }
      })
      .run();

  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ error: 'Error interno' });
  }
};

// 👇 3. ¡NO OLVIDES EXPORTARLA! 👇
module.exports = { start, stop, list, downloadVideo, deleteRecording, trimVideo };