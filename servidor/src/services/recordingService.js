// src/services/recordingService.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const activeRecordings = {};

const storageDir = path.join(__dirname, '../../storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir);
}

const startRecording = async (cameraId, streamUrl) => {
  if (activeRecordings[cameraId]) {
    throw new Error('La cámara ya está grabando');
  }

  const filename = `cam-${cameraId}-${Date.now()}.mp4`;
  const filePath = path.join(storageDir, filename);

  console.log(`🎥 Iniciando grabación: ${filename}`);

  return new Promise((resolve, reject) => {
    const command = ffmpeg(streamUrl)
      .inputOptions([
          '-timeout 5000000',
          '-use_wallclock_as_timestamps 1', // Arregla tiempos
      ])
      .videoCodec('libx264')
      .outputOptions([
          '-r 20', // Forzar 20 FPS (estabilidad)
          '-vf scale=1280:-2,format=yuv420p', // 720p y colores compatibles Windows
          '-preset ultrafast',
          '-an', // Sin audio
          
          // 👇 ESTO ES EL SEGURO DE VIDA PARA WINDOWS 👇
          // Si el cierre suave falla, esto permite que el archivo se vea igual.
          '-movflags frag_keyframe+empty_moov+default_base_moof',
          // ---------------------------------------------
          
          '-t 300' // Límite 5 min
      ])
      .on('stderr', (stderrLine) => {
         // Descomenta si necesitas depurar, pero ensucia mucho la consola
         // console.log('🎞️ FFmpeg Log:', stderrLine);
      })
      .on('start', async () => {
        // Guardar en BDD
        const query = `
          INSERT INTO "Recordings" (camera_id, file_path, start_time, trigger_type)
          VALUES ($1, $2, NOW(), 'manual')
          RETURNING recording_id
        `;
        const res = await db.query(query, [cameraId, filename]);
        
        activeRecordings[cameraId] = {
          command: command,
          recordingId: res.rows[0].recording_id,
          filePath: filename,
          startTime: new Date()
        };
        resolve(activeRecordings[cameraId]);
      })
      .on('error', (err) => {
        // Ignoramos errores si son causados por nosotros deteniéndolo
        if (!err.message.includes('SIGINT') && !err.message.includes('Output stream closed')) {
           console.error('❌ Error FFmpeg:', err.message);
        }
        // No borramos activeRecordings aquí para permitir que stopRecording haga la limpieza DB
      })
      .on('end', () => {
        console.log('✅ FFmpeg terminó el proceso internamente.');
        // Llamamos a stopRecording para asegurar limpieza de DB si terminó por tiempo
        if (activeRecordings[cameraId]) {
           stopRecording(cameraId); 
        }
      })
      .save(filePath);
  });
};

const stopRecording = async (cameraId) => {
  const recordSession = activeRecordings[cameraId];
  if (!recordSession) return;

  console.log('🛑 Intentando detener grabación suavemente...');

  try {
    // 1. INTENTO SUAVE: Enviamos 'q' (Quit) a la entrada de FFmpeg
    // Esto funciona mejor en Windows que SIGINT
    if (recordSession.command.ffmpegProc && recordSession.command.ffmpegProc.stdin) {
        recordSession.command.ffmpegProc.stdin.write('q');
    } else {
        // Fallback: Si no podemos escribir, matamos el proceso
        recordSession.command.kill('SIGINT');
    }
  } catch (err) {
      // Si falla escribir 'q', forzamos muerte
      recordSession.command.kill('SIGINT');
  }

  // 2. Esperar a que se cierre el archivo
  setTimeout(async () => {
    try {
      if (fs.existsSync(path.join(storageDir, recordSession.filePath))) {
        
        const stats = fs.statSync(path.join(storageDir, recordSession.filePath));
        
        // Solo actualizamos si el archivo tiene tamaño > 0
        if (stats.size > 0) {
            const query = `
              UPDATE "Recordings" 
              SET end_time = NOW(), file_size_bytes = $1
              WHERE recording_id = $2
            `;
            await db.query(query, [stats.size, recordSession.recordingId]);
            console.log(`💾 Grabación guardada exitosamente: ${recordSession.filePath} (${(stats.size / 1024).toFixed(2)} KB)`);
        } else {
            console.warn('⚠️ Archivo vacío (0 bytes). Borrando...');
            await db.query('DELETE FROM "Recordings" WHERE recording_id = $1', [recordSession.recordingId]);
        }
      
      } else {
        console.warn('⚠️ Archivo no encontrado en disco.');
        await db.query('DELETE FROM "Recordings" WHERE recording_id = $1', [recordSession.recordingId]);
      }

    } catch (e) {
      console.error('Error finalizando grabación:', e);
    }
    
    // 3. Limpieza final de memoria
    delete activeRecordings[cameraId];
    
  }, 1500); // Damos 1.5 segundos para asegurar escritura en disco lento
};

module.exports = { startRecording, stopRecording, activeRecordings };