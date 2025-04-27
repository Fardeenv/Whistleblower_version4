import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAuthenticated } from './services/auth';

import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import MyCasesPage from './pages/MyCasesPage';
import ReportDetailPage from './pages/ReportDetailPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Authenticated Layout component to avoid repetition
  const AuthenticatedLayout = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    
    return (
      <>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <button className="mobile-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div className={`main-content ${sidebarOpen ? '' : 'shifted'}`}>
          {children}
        </div>
      </>
    );
  };
  
  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />
          } />
          
          <Route path="/" element={
            isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <AuthenticatedLayout>
              <DashboardPage />
            </AuthenticatedLayout>
          } />
          
          <Route path="/reports" element={
            <AuthenticatedLayout>
              <ReportsPage />
            </AuthenticatedLayout>
          } />
          
          <Route path="/reports/:id" element={
            <AuthenticatedLayout>
              <ReportDetailPage />
            </AuthenticatedLayout>
          } />
          
          <Route path="/my-cases" element={
            <AuthenticatedLayout>
              <MyCasesPage />
            </AuthenticatedLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
