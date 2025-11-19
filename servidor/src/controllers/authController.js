const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // <--- 1. IMPORTAR JWT

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ... (Aquí va tu lógica de buscar usuario y comparar bcrypt que ya hicimos) ...
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // --------------------------------------------------------
    // 2. GENERAR EL TOKEN REAL
    // --------------------------------------------------------
    
    // Payload: Datos que viajan ENCRIPTADOS dentro del token.
    // No pongas la contraseña aquí. Solo ID y Rol.
    const tokenPayload = {
      id: user.user_id,
      username: user.username,
      role: user.role_id
    };

    const token = jwt.sign(
      tokenPayload,           // Datos
      process.env.JWT_SECRET, // Tu llave secreta del .env
      { expiresIn: '8h' }     // Tiempo de vida (8 horas)
    );

    // --------------------------------------------------------
    
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log('✅ Token generado exitosamente');

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token: token // <--- 3. ENVIAMOS EL TOKEN REAL
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = { login };