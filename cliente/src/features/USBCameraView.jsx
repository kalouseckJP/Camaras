import React, { useRef, useEffect } from 'react';

function USBCameraView() {
  // useRef es la forma de React de acceder a un elemento del DOM (como el <video>)
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null; // Variable para guardar el stream y poder limpiarlo

    // Función asíncrona para iniciar la cámara
    const startCamera = async () => {
      try {
        // 1. Pedir permiso al usuario
        // Pedimos solo video, no audio
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        // 2. Si tenemos el ref del video, le pasamos el stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // Manejar errores (ej: el usuario negó el permiso, no hay cámara)
        console.error('Error al acceder a la cámara USB:', err);
      }
    };

    startCamera();

    // 3. Función de "limpieza" (Cleanup)
    // Se ejecuta cuando el componente se "desmonta" (ej: cambias de página)
    return () => {
      if (stream) {
        // Detenemos todas las pistas (esto apaga la luz de la cámara)
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // El array vacío `[]` significa que este efecto se ejecuta solo 1 vez (al montar)

  return (
    <div className="w-full h-full bg-black rounded-md overflow-hidden">
      <video
        ref={videoRef}
        autoPlay // Iniciar video automáticamente
        playsInline // Necesario para que funcione en móviles
        muted // Silenciado (necesario para autoplay en muchos navegadores)
        className="w-full h-full object-cover" // object-cover para que llene el espacio
      />
    </div>
  );
}

export default USBCameraView;