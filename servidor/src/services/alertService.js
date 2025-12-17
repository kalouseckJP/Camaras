// src/services/alertService.js
const nodemailer = require('nodemailer');
const db = require('../config/db');

// Función auxiliar para configurar el transporte de correo leyendo desde la BD
async function createTransporter() {
  try {
    // Obtenemos las credenciales de la tabla SystemSettings
    const res = await db.query('SELECT setting_key, setting_value FROM "SystemSettings"');
    const settings = {};
    
    res.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    // Validamos que existan los datos mínimos
    if (!settings.smtp_user || !settings.smtp_pass || !settings.smtp_host) {
      // Si falta host, asumimos mailersend por defecto o lanzamos error
      settings.smtp_host = settings.smtp_host || 'smtp.mailersend.net';
    }

    // Creamos el transportador
    return nodemailer.createTransport({
      host: settings.smtp_host,
      port: parseInt(settings.smtp_port) || 587,
      secure: false, // true para 465, false para otros
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_pass,
      },
    });

  } catch (error) {
    console.error('❌ Error configurando SMTP:', error);
    return null;
  }
}

// Función principal que llama el cronService
const sendCameraOfflineAlert = async (camera) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) return;

    // Obtener el email del admin y el remitente desde la BD
    const resSettings = await db.query(
        "SELECT setting_key, setting_value FROM \"SystemSettings\" WHERE setting_key IN ('admin_email', 'smtp_from')"
    );
    
    const config = {};
    resSettings.rows.forEach(r => config[r.setting_key] = r.setting_value);

    const mailOptions = {
      from: config.smtp_from || '"Sistema de Seguridad" <no-reply@seguridad.com>',
      to: config.admin_email,
      subject: `⚠️ ALERTA: Cámara ${camera.name} Desconectada`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #d9534f;">⚠️ Alerta de Seguridad</h2>
          <p>El sistema ha detectado que una cámara ha dejado de responder.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Cámara:</td>
              <td style="padding: 8px;">${camera.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">IP:</td>
              <td style="padding: 8px;">${camera.ip_address}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Hora:</td>
              <td style="padding: 8px;">${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">
            Por favor, verifique la conexión eléctrica y de red del dispositivo.
          </p>
        </div>
      `
    };

    //const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Alerta enviada: ${info.messageId}`);
    
    // Registrar la alerta en la base de datos (SystemAlerts)
    await db.query(
        "INSERT INTO \"SystemAlerts\" (type, message, created_at) VALUES ($1, $2, NOW())",
        ['ERROR', `Cámara ${camera.name} (${camera.ip_address}) desconectada.`]
    );

  } catch (error) {
    //console.error('❌ Error enviando correo de alerta:', error);
  }
};

module.exports = { sendCameraOfflineAlert };