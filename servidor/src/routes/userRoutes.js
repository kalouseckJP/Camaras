// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');

// Todas las rutas protegidas
router.get('/', verifyToken, userController.getAllUsers);
router.post('/', verifyToken, userController.createUser);
router.delete('/:id', verifyToken, userController.deleteUser);
router.get('/:id', verifyToken, userController.getUserById); // Obtener datos para el form
router.put('/:id', verifyToken, userController.updateUser);  // Guardar cambios

module.exports = router;