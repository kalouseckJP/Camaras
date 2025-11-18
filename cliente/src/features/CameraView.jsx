import React from 'react';
import ReactPlayer from 'react-player';

// Este componente recibe la URL del stream HLS (ej: http://.../stream.m3u8)
function CameraView({ streamUrl }) {

  if (!streamUrl) {
    return (
      <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
        <span className="text-gray-400">Sin señal</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
      <ReactPlayer
        url={streamUrl}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        playing={true} // Iniciar reproduciendo automáticamente
        muted={true}   // Silenciado (necesario para autoplay en muchos navegadores)
        controls={true} // Muestra controles (play, pausa, etc.)
        config={{
          file: {
            // Opciones específicas si es HLS
            hlsOptions: {
              // Puedes configurar buffer, etc. aquí
            }
          }
        }}
        onError={(e) => console.error('Error al cargar el video', e)}
      />
    </div>
  );
}

export default CameraView;