// src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Necesario para encriptar la nueva contraseña

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, email, role_id } = req.body;

    // Validaciones básicas
    if (!username || !password || !role_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // 1. ENCRIPTAR CONTRASEÑA (Igual que hicimos en el script create-admin)
    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Guardar en BD
    const newUser = await User.create({
      username,
      password_hash: passwordHash,
      email: email || '', // Email opcional
      role_id
    });

    res.status(201).json({ message: 'Usuario creado', user: newUser });

  } catch (error) {
    console.error(error);
    // Código 23505 en Postgres significa "Violación de Unique" (usuario ya existe)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario o email ya existe' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Evitar que se borre a sí mismo (seguridad básica)
    // req.user viene del token JWT gracias al middleware verifyToken
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const deleted = await User.delete(id);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

// Obtener un solo usuario
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    // Quitamos el hash por seguridad antes de enviarlo
    const { password_hash, ...userWithoutPass } = user;
    res.json(userWithoutPass);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role_id, password } = req.body;

    // 1. Buscamos el usuario actual para tener sus datos viejos
    const currentUser = await User.findById(id);
    if (!currentUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    let finalPasswordHash = currentUser.password_hash;

    // 2. Si enviaron una contraseña NUEVA, la encriptamos
    if (password && password.trim() !== '') {
      finalPasswordHash = await bcrypt.hash(password, 10);
    }

    // 3. Guardamos
    const updatedUser = await User.update(id, {
      username,
      email,
      role_id,
      password_hash: finalPasswordHash // Usamos la nueva o la vieja
    });

    res.json({ message: 'Usuario actualizado', user: updatedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

module.exports = { getAllUsers, createUser, deleteUser, getUserById, updateUser };