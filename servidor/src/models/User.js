// src/models/User.js
const db = require('../config/db');

const User = {
  // Buscar por username (Login)
  findByUsername: async (username) => {
    const query = 'SELECT * FROM "Users" WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
  },

  // Listar todos (sin devolver la contraseña)
  findAll: async () => {
    const query = `
      SELECT u.user_id, u.username, u.email, u.created_at, r.role_name 
      FROM "Users" u
      JOIN "Roles" r ON u.role_id = r.role_id
      ORDER BY u.user_id ASC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Crear usuario nuevo
  create: async (data) => {
    const { username, password_hash, email, role_id } = data;
    const query = `
      INSERT INTO "Users" (username, password_hash, email, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, username, email, role_id
    `;
    const result = await db.query(query, [username, password_hash, email, role_id]);
    return result.rows[0];
  },

  // Eliminar usuario
  delete: async (id) => {
    const query = 'DELETE FROM "Users" WHERE user_id = $1 RETURNING user_id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  // Buscar un usuario por ID (para editar)
  findById: async (id) => {
    const query = `
      SELECT user_id, username, email, role_id, password_hash 
      FROM "Users" 
      WHERE user_id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Actualizar usuario
  update: async (id, data) => {
    const { username, email, role_id, password_hash } = data;
    const query = `
      UPDATE "Users" 
      SET username = $1, email = $2, role_id = $3, password_hash = $4
      WHERE user_id = $5
      RETURNING user_id, username, email, role_id
    `;
    const result = await db.query(query, [username, email, role_id, password_hash, id]);
    return result.rows[0];
  }
};

module.exports = User;