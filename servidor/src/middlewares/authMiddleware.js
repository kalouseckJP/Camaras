const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Buscar el token en los headers
  const authHeader = req.headers['authorization'];
  // El formato suele ser "Bearer eyJhbG..."
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado: Falta el token' });
  }

  try {
    // 2. Verificar si el token es válido con nuestra clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Guardar los datos del usuario en la petición para usarlos luego
    req.user = decoded;
    
    next(); // Dejar pasar a la siguiente función
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;