// src/routes/cameraRoutes.js
const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const verifyToken = require('../middlewares/authMiddleware'); // ¡Protección!

// GET /api/cameras -> Listar todas
router.get('/', verifyToken, cameraController.getAllCameras);

// POST /api/cameras -> Crear nueva
router.post('/', verifyToken, cameraController.addCamera);

router.put('/:id', verifyToken, cameraController.updateCamera);   // Editar
router.delete('/:id', verifyToken, cameraController.deleteCamera); // Borrar
router.get('/:id', verifyToken, cameraController.getCameraById);   // Obtener por ID

module.exports = router;