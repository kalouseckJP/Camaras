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
    
    // 1. CONSTRUIMOS EL FILTRO MANUALMENTE (Más seguro)
    // Cadena: Texto -> Escalado -> Formato de Pixel
    // Nota: Usamos 'arial.ttf' asumiendo que está en la raíz donde corres "node"
    const videoFilters = [
      // 1. Fecha y Hora
      "drawtext=fontfile='arial.ttf':text='%{localtime\\:%Y-%m-%d %H\\\\\\:%M\\\\\\:%S}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:x=10:y=10",
      
      // 2. Censura (Descomenta esta línea) 👇
      "drawbox=x=100:y=100:w=200:h=100:color=black:t=fill",
      
      // 3. Escalado y Formato
      "scale=1280:-2",
      "format=yuv420p"
    ].join(',');

    const command = ffmpeg(streamUrl)
      .inputOptions([
          '-timeout 5000000',
          '-use_wallclock_as_timestamps 1', 
      ])
      .videoCodec('libx264')
      
      // 2. USAMOS LA CADENA DE FILTROS CREADA ARRIBA
      .complexFilter(videoFilters)

      .outputOptions([
          '-r 20', 
          '-preset ultrafast',
          '-an', 
          '-movflags frag_keyframe+empty_moov+default_base_moof',
          '-t 300' 
      ])
      
      // 3. MODO DEBUG: Ver qué comando exacto se ejecuta
      .on('start', async (commandLine) => {
        console.log('💡 COMANDO FFMPEG:', commandLine); // <--- ESTO NOS DIRÁ EL ERROR SI FALLA

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
      
      .on('stderr', (stderrLine) => {
          // Descomenta solo si sigue fallando para ver el detalle
          // console.log('🎞️ Log:', stderrLine);
      })
      
      .on('error', (err) => {
        if (!err.message.includes('SIGINT') && !err.message.includes('Output stream closed')) {
           console.error('❌ Error FFmpeg:', err.message);
        }
      })
      .on('end', () => {
        console.log('✅ FFmpeg terminó internamente.');
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

  console.log('🛑 Deteniendo grabación...');

  try {
    if (recordSession.command.ffmpegProc && recordSession.command.ffmpegProc.stdin) {
        recordSession.command.ffmpegProc.stdin.write('q');
    } else {
        recordSession.command.kill('SIGINT');
    }
  } catch (err) {
      recordSession.command.kill('SIGINT');
  }

  setTimeout(async () => {
    try {
      if (fs.existsSync(path.join(storageDir, recordSession.filePath))) {
        const stats = fs.statSync(path.join(storageDir, recordSession.filePath));
        if (stats.size > 0) {
            const query = `
              UPDATE "Recordings" 
              SET end_time = NOW(), file_size_bytes = $1
              WHERE recording_id = $2
            `;
            await db.query(query, [stats.size, recordSession.recordingId]);
            console.log(`💾 Guardado: ${recordSession.filePath}`);
        } else {
            await db.query('DELETE FROM "Recordings" WHERE recording_id = $1', [recordSession.recordingId]);
        }
      } else {
        await db.query('DELETE FROM "Recordings" WHERE recording_id = $1', [recordSession.recordingId]);
      }
    } catch (e) {
      console.error('Error finalizando:', e);
    }
    delete activeRecordings[cameraId];
  }, 1500); 
};

module.exports = { startRecording, stopRecording, activeRecordings };