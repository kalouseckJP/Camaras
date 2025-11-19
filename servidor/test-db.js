// servidor/create-admin.js
const bcrypt = require('bcrypt');
const db = require('./src/config/db'); // Tu conexión a la BD

async function crearAdmin() {
  const username = 'admin';
  const passwordPlano = '123';
  const email = 'admin@seguridad.com';
  
  try {
    console.log('🔐 Generando hash de contraseña...');
    
    // 1. ENCRIPTAR LA CONTRASEÑA
    // El "10" es el "cost factor" (qué tan lento/seguro es el proceso)
    const passwordHash = await bcrypt.hash(passwordPlano, 10);
    
    console.log(`Hash generado: ${passwordHash}`);

    // 2. INSERTAR EN LA BASE DE DATOS
    // Asegúrate de borrar el usuario anterior si tiene el mismo username
    await db.query('DELETE FROM "Users" WHERE username = $1', [username]);

    const query = `
      INSERT INTO "Users" (username, password_hash, email, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const res = await db.query(query, [username, passwordHash, email, 1]);
    
    console.log('✅ Usuario creado exitosamente:', res.rows[0]);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
  } finally {
    // Cerramos el script
    process.exit();
  }
}

crearAdmin();