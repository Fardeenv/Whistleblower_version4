import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAuthenticated, hasRole } from './services/auth';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import MyCasesPage from './pages/MyCasesPage';
import ReportDetailPage from './pages/ReportDetailPage';

// Layout component to wrap authenticated pages
const AuthenticatedLayout = ({ children }) => (
  <>
    <Header />
    <main className="main-content">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />
          } />
          
          <Route path="/" element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
          
          {/* Protected routes with layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <DashboardPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ReportsPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ReportDetailPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-cases" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <MyCasesPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
        </Routes>
        
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </Router>
  );
}

export default App;
