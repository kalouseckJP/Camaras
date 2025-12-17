require('dotenv').config();
const express = require('express');
const cors = require('cors');
const recordingController = require('./controllers/recordingController');
const authRoutes = require('./routes/authRoutes'); // Importar rutas
const cameraRoutes = require('./routes/cameraRoutes'); // Importar rutas
const userRoutes = require('./routes/userRoutes'); // Importar rutas
const statsController = require('./controllers/statsController'); // Importar
const verifyToken = require('./middlewares/authMiddleware');
const logController = require('./controllers/logController'); // Importar
const systemController = require('./controllers/systemController');
const { initCronJobs } = require('./services/cronService');


const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.16:5173',
  'http://0.0.0.0:5173',
  'http://10.0.21.65:5173',
  'http://10.0.4.29:5173'
]

// Middlewares
app.use(cors({
  origin: allowedOrigins, // Permitir solo a tu frontend
  credentials: true // Permitir cookies/headers
})); // Permite que React se conecte
app.use(express.json()); // <--- CRUCIAL: Permite leer JSON del Body

const path = require('path');
app.use('/videos', express.static(path.join(__dirname, '../storage')));

// Rutas
app.use('/api/auth', authRoutes); 
app.use('/api/cameras', cameraRoutes);
app.use('/api/users', userRoutes);
app.post('/api/recordings/start', recordingController.start);
app.post('/api/recordings/stop', recordingController.stop);
app.get('/api/recordings', recordingController.list);
app.get('/api/recordings/download/:id', recordingController.downloadVideo);
app.delete('/api/recordings/:id', recordingController.deleteRecording);
app.get('/api/stats', verifyToken, statsController.getSummary);
app.get('/api/logs', verifyToken, logController.getLogs);
app.post('/api/recordings/trim/:id', recordingController.trimVideo);
app.get('/api/settings', verifyToken, systemController.getSettings);
app.post('/api/settings', verifyToken, systemController.updateSettings); // Solo Admin debería poder
app.get('/api/alerts', verifyToken, systemController.getAlerts);
// Esto crea la URL base: http://localhost:3000/api/auth/login

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  initCronJobs();
});