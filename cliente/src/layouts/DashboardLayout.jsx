// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet es donde se renderizarán las páginas
import Sidebar from './Sidebar';
import Header from './Header';

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      
      {/* 1. Sidebar Fijo */}
      <Sidebar />

      {/* 2. Área Principal (Header + Contenido) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2.1. Header */}
        <Header />

        {/* 2.2. Contenido de la Página (Outlet) */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Aquí se renderizará LiveViewPage, RecordingsPage, etc. */}
          <Outlet /> 
        </main>
        
      </div>
    </div>
  );
}

export default DashboardLayout;