require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Si no lo tienes: npm install cors
const authRoutes = require('./routes/authRoutes'); // Importar rutas
const cameraRoutes = require('./routes/cameraRoutes'); // Importar rutas
const userRoutes = require('./routes/userRoutes'); // Importar rutas

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

// Rutas
app.use('/api/auth', authRoutes); 
app.use('/api/cameras', cameraRoutes);
app.use('/api/users', userRoutes);
// Esto crea la URL base: http://localhost:3000/api/auth/login

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});