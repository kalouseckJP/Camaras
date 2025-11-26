// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  // Esta es la URL base de tu backend
  baseURL: 'http://192.168.1.16:3000/api',
  // Tiempo máximo de espera (timeout) de 10 segundos
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;