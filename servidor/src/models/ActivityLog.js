// src/models/ActivityLog.js
const db = require('../config/db');

const ActivityLog = {
  // Crear un nuevo registro
  create: async (userId, action, targetId = null, ipAddress = null) => {
    const query = `
      INSERT INTO "ActivityLogs" (user_id, action, target_id, ip_address)
      VALUES ($1, $2, $3, $4)
    `;
    // Si targetId es null, Postgres lo guardará como NULL
    await db.query(query, [userId, action, targetId, ipAddress]);
  },

  // Obtener historial
  findAll: async () => {
    const query = `
      SELECT l.*, u.username, u.role_id 
      FROM "ActivityLogs" l
      JOIN "Users" u ON l.user_id = u.user_id
      ORDER BY l.timestamp DESC -- Ojo: Tu columna se llama 'timestamp', no 'created_at'
      LIMIT 100
    `;
    const result = await db.query(query);
    return result.rows;
  }
};

module.exports = ActivityLog;