// src/controllers/logController.js
const ActivityLog = require('../models/ActivityLog');

const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo logs' });
  }
};

module.exports = { getLogs };