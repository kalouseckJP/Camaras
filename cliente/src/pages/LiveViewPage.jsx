import React from 'react';

// En el futuro, aquí importarías los componentes de "features" que construyen esta página
// import CameraGrid from '../features/streaming/CameraGrid';
// import LayoutSelector from '../features/streaming/LayoutSelector';

function LiveViewPage() {
  return (
    <div>
      {/* Título de la Página */}
      <h1 className="text-3xl font-bold mb-6 text-white">
        Vista en Vivo
      </h1>
      
      {/* Aquí iría el contenido principal de esta página.
        Por ahora, es un placeholder. Más adelante, aquí iría tu 
        componente <CameraGrid /> que mostrará el video.
      */}
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 
                      min-h-[600px] flex items-center justify-center">
        
        <p className="text-gray-400 text-xl">
          (Contenido de la Grilla de Cámaras)
        </p>

        {/* En el futuro, esto se vería así:
          <div className="controles-superiores">
             <LayoutSelector />
          </div>
          <CameraGrid />
        */}
      </div>
    </div>
  );
}

export default LiveViewPage;