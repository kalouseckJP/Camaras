// Importamos la configuración de la base de datos que creamos antes
const db = require('../config/db');

const User = {
  // Función para buscar un usuario por su username
  findByUsername: async (username) => {
    const query = 'SELECT * FROM "Users" WHERE username = $1';
    const values = [username];
    
    const result = await db.query(query, values);
    return result.rows[0]; // Retorna el primer usuario encontrado o undefined
  },

  // Aquí puedes agregar más consultas relacionadas con usuarios...
  create: async (userData) => { /* INSERT INTO... */ },
  findById: async (id) => { /* SELECT ... WHERE id = $1 */ }
};

module.exports = User;