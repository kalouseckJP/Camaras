// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // <-- Importar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- Poner BrowserRouter aquí */}
      <AuthProvider> {/* <-- Envolver App */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);