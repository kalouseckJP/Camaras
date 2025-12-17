// src/services/cronService.js
const cron = require('node-cron');
const ping = require('ping');
const axios = require('axios');
const db = require('../config/db');
const fs = require('fs'); 
const path = require('path');
const alertService = require('./alertService');

// Configuración de sensibilidad
const FAILURE_THRESHOLD = 3; // Cuántas veces debe fallar para enviar alerta
const failureCounts = {}; // Memoria temporal de fallos

// --- 1. FUNCIÓN AUXILIAR: Chequeo HTTP ---
const checkHttpStream = async (url) => {
  try {
    // Intentamos conectar con un timeout corto (3 segundos)
    await axios.get(url, { 
      timeout: 3000,
      responseType: 'stream' 
    });
    return true; // Conexión exitosa
  } catch (error) {
    // Si es error 401 (no autorizado) significa que el servidor existe
    if (error.response && error.response.status === 401) return true;
    return false; // Error de conexión o timeout
  }
};

// --- 2. TAREA DE BACKUP (Tu código original) ---
const performBackup = async () => {
  console.log('📦 Iniciando proceso de Backup...');
  
  try {
    const resConfig = await db.query("SELECT setting_value FROM \"SystemSettings\" WHERE setting_key = 'backup_path'");
    if (resConfig.rows.length === 0) return;
    
    const backupPath = resConfig.rows[0].setting_value;
    
    if (!backupPath || !fs.existsSync(backupPath)) {
      console.warn(`⚠️ Ruta de backup no válida: ${backupPath}`);
      return;
    }

    const pendingVideos = await db.query(`
      SELECT recording_id, file_path 
      FROM "Recordings" 
      WHERE is_backed_up = FALSE 
      LIMIT 10
    `);

    if (pendingVideos.rows.length === 0) {
      // console.log('✅ No hay videos para respaldar.');
      return;
    }

    for (const video of pendingVideos.rows) {
      const sourcePath = path.join(__dirname, '../../storage', video.file_path);
      const destPath = path.join(backupPath, video.file_path);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        await db.query('UPDATE "Recordings" SET is_backed_up = TRUE WHERE recording_id = $1', [video.recording_id]);
        console.log(`💾 Backup exitoso: ${video.file_path}`);
      } else {
        console.error(`❌ Archivo original no encontrado: ${video.file_path}`);
      }
    }
  } catch (error) {
    console.error('Error durante el backup:', error);
  }
};

// --- 3. DIAGNÓSTICO DE CONECTIVIDAD (Lógica Mejorada) ---
const checkCamerasConnectivity = async () => {
  try {
    // Obtenemos también la URL del stream principal
    const res = await db.query('SELECT camera_id, name, ip_address, stream_url_main FROM "Cameras"');
    const cameras = res.rows;

    for (const cam of cameras) {
      let isAlive = false;

      // A) Si es la cámara USB Local, siempre está viva
      if (cam.camera_id === 'local-usb') {
          isAlive = true;
      }
      // B) ESTRATEGIA HTTP: Si tiene URL http, probamos el stream directo
      else if (cam.stream_url_main && cam.stream_url_main.startsWith('http')) {
        isAlive = await checkHttpStream(cam.stream_url_main);
      } 
      // C) ESTRATEGIA PING: Fallback si no hay URL
      else if (cam.ip_address) {
        const state = await ping.promise.probe(cam.ip_address, { timeout: 2 });
        isAlive = state.alive;
      }

      // --- ACTUALIZAR BASE DE DATOS ---
      await db.query(
        'UPDATE "Cameras" SET is_online = $1, last_checked = NOW() WHERE camera_id = $2',
        [isAlive, cam.camera_id]
      );

      // --- GESTIÓN DE ALERTAS (Con contador) ---
      if (!isAlive) {
        // Incrementamos contador de fallos
        failureCounts[cam.camera_id] = (failureCounts[cam.camera_id] || 0) + 1;
        
        console.warn(`⚠️ ${cam.name} no responde (Intento ${failureCounts[cam.camera_id]}/${FAILURE_THRESHOLD})`);

        // Solo enviamos correo si alcanzamos el umbral (ej. 3 fallos seguidos)
        if (failureCounts[cam.camera_id] === FAILURE_THRESHOLD) {
           console.log(`📧 Enviando alerta crítica para ${cam.name}...`);
           
           // Usamos tu servicio de alertas existente
           await alertService.sendCameraOfflineAlert(cam);
        }
      } else {
        // Si responde, reseteamos el contador
        if (failureCounts[cam.camera_id] > 0) {
          console.log(`✅ La cámara ${cam.name} ha recuperado la conexión.`);
        }
        failureCounts[cam.camera_id] = 0;
      }
    }
  } catch (error) {
    console.error('Error en diagnóstico:', error);
  }
};

// --- 4. LIMPIEZA (Placeholder) ---
const cleanOldRecordings = async () => {
  // console.log('🧹 Limpieza programada ejecutada');
};

// --- 5. INICIADOR DE TAREAS ---
const initCronJobs = () => {
  console.log('🕒 Sistema de Cron Jobs iniciado.');

  // Tarea 1: Verificar conexión cada 30 SEGUNDOS (Más rápido para que detectes errores)
  cron.schedule('*/30 * * * * *', () => {
    checkCamerasConnectivity();
  });

  // Tarea 2: Backup cada 5 minutos (para que no se acumulen)
  cron.schedule('*/5 * * * *', () => {
    performBackup();
  });

  // Tarea 3: Limpieza profunda a las 3:00 AM
  cron.schedule('0 3 * * *', () => {
    cleanOldRecordings();
  });
};

module.exports = { initCronJobs };