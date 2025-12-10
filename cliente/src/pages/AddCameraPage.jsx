// Importamos el formulario que acabamos de crear
import CameraForm from '../features/CameraForm'; 
function AddCameraPage() {
  return (
    <div>
      {/* Título de la Página */}
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Añadir Nueva Cámara
      </h1>
      
      {/* Contenido de la Página */}
      <div className="w-full">
        <CameraForm />
      </div>
    </div>
  );
}

export default AddCameraPage;