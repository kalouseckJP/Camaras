// src/controllers/systemController.js
const db = require('../config/db');

// --- CONFIGURACIÓN ---

const getSettings = async (req, res) => {
  try {
    // Obtenemos todo como un objeto { key: value }
    const result = await db.query('SELECT * FROM "SystemSettings"');
    
    // Convertimos el array de filas a un objeto fácil de usar en Frontend
    // De: [{setting_key: 'backup_path', setting_value: '/mnt...'}, ...]
    // A:  { backup_path: '/mnt...', storage_retention_days: '90', ... }
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settingsToUpdate = req.body; // Ej: { storage_retention_days: '60' }
    
    // Iteramos sobre las claves que nos envíen y actualizamos una por una
    // Usamos UPSERT (INSERT ... ON CONFLICT) por si acaso alguna no existe
    const queries = Object.keys(settingsToUpdate).map(async (key) => {
      const value = settingsToUpdate[key];
      const query = `
        INSERT INTO "SystemSettings" (setting_key, setting_value)
        VALUES ($1, $2)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = EXCLUDED.setting_value;
      `;
      return db.query(query, [key, String(value)]);
    });

    await Promise.all(queries);
    res.json({ message: 'Configuración actualizada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando configuración' });
  }
};

// --- ALERTAS ---

const getAlerts = async (req, res) => {
  try {
    // Traemos las últimas 50 alertas
    const result = await db.query('SELECT * FROM "SystemAlerts" ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo alertas' });
  }
};

module.exports = { getSettings, updateSettings, getAlerts };