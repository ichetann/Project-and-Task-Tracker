// src/components/Layout/Layout.jsx

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar />
      
      {/* Main Container with Sidebar */}
      <div className="flex pt-16"> {/* pt-16 = padding-top to account for fixed navbar */}
        {/* Sidebar - Fixed on left */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 ml-64 min-h-screen"> {/* ml-64 = margin-left for sidebar width */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;