// src/routes/authRoutes.js
const express = require('express');
const router = express.Router(); // <--- ESTO es lo que Express necesita

// Importamos el controlador que acabamos de guardar en el Paso 1
const authController = require('../controllers/authController');

// Definimos que cuando alguien haga POST a '/', se ejecute la función login
router.post('/login', authController.login);

// 👇 ESTO ES LO QUE FALTABA: Exportar el router
module.exports = router;