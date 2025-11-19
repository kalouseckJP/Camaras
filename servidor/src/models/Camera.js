// src/models/Camera.js
const db = require('../config/db');

const Camera = {
  // Crear una nueva cámara
  create: async (data) => {
    const { name, ip_address, stream_url_main, stream_url_sub } = data;
    
    const query = `
      INSERT INTO "Cameras" (name, ip_address, stream_url_main, stream_url_sub, current_status)
      VALUES ($1, $2, $3, $4, 'online')
      RETURNING *
    `;
    
    const values = [name, ip_address, stream_url_main, stream_url_sub];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Obtener todas las cámaras (para listarlas luego)
  findAll: async () => {
    const query = 'SELECT * FROM "Cameras" ORDER BY camera_id ASC';
    const result = await db.query(query);
    return result.rows;
  },

  // Buscar por ID (para editar luego)
  findById: async (id) => {
    const query = 'SELECT * FROM "Cameras" WHERE camera_id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  // Editar cámara (Update)
  update: async (id, data) => {
    const { name, ip_address, stream_url_main } = data;
    const query = `
      UPDATE "Cameras" 
      SET name = $1, ip_address = $2, stream_url_main = $3
      WHERE camera_id = $4
      RETURNING *
    `;
    const result = await db.query(query, [name, ip_address, stream_url_main, id]);
    return result.rows[0];
  },

  // Eliminar cámara

  delete: async (id) => {
    const query = 'DELETE FROM "Cameras" WHERE camera_id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = Camera;