import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { TasksPage } from './pages/TasksPage';
import { DsaPage } from './pages/DsaPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (Redirects to Tasks if already logged in)
const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (token) return <Navigate to="/" replace />;
  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Core App Tabs: 1. Tasks  2. DSA Sheet */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Tab 1: Tasks (Default Home) */}
        <Route index element={<TasksPage />} />
        <Route path="tasks" element={<Navigate to="/" replace />} />

        {/* Tab 2: DSA Sheet */}
        <Route path="dsa" element={<DsaPage />} />

        {/* Legacy redirects */}
        <Route path="habits" element={<Navigate to="/dsa" replace />} />
        <Route path="progress" element={<Navigate to="/dsa" replace />} />
      </Route>

      {/* Catch-all redirect to / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
