// src/config/db.js
require('dotenv').config(); // Cargar variables de entorno
const { Pool } = require('pg');

// Creamos un "Pool" de conexiones. 
// Esto es mejor que una conexión simple porque maneja múltiples peticiones simultáneas eficientemente.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Opcional: Configuración SSL requerida por Supabase en algunos casos
  ssl: {
    rejectUnauthorized: false 
  }
});

// Evento para saber cuando nos conectamos exitosamente (opcional, para debug)
pool.on('connect', () => {
  console.log('✅ Base de datos conectada exitosamente');
});

// Exportamos un método "query" para usarlo en el resto de la app
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exportamos el pool por si necesitamos cerrarlo o usar transacciones complejas
};