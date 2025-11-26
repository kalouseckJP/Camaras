// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Outlet es donde se renderizarán las páginas
import Sidebar from './Sidebar';
import Header from './Header';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 dark:text-white overflow-hidden">
      
      {/* 1. Sidebar Fijo / Collapsible */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* 2. Área Principal (Header + Contenido) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Toggle button visible sobre el header (móvil/desktop) */}
        <button
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-30 p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none"
        >
          {/* simple icon */}
          <span className="text-xl dark:text-white">☰</span>
        </button>
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