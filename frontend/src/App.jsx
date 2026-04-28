// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectList from './components/Projects/ProjectList';
import ProjectDetail from './components/Projects/ProjectDetail';
import TaskList from './components/Tasks/TaskList';
import Layout from './components/Layout/Layout';
import { ToastContainer} from 'react-toastify';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  return (
    <div>
          <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout>
            <ProjectList />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/projects/:id" element={
        <ProtectedRoute>
          <Layout>
            <ProjectDetail />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute>
          <Layout>
            <TaskList />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* 404 */}
      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600">Page not found</p>
          </div>
        </div>
      } />
    </Routes>
      <ToastContainer />
    </div>

  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;