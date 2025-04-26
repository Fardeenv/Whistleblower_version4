import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SubmitReportPage from './pages/SubmitReportPage';
import CheckStatusPage from './pages/CheckStatusPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

// For simplicity, we'll use placeholder components for admin pages
const AdminLoginPage = () => <div className="container">Admin Login Page</div>;
const AdminDashboardPage = () => <div className="container">Admin Dashboard</div>;
const AdminReportDetailPage = () => <div className="container">Admin Report Detail</div>;

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/:id" element={
            <ProtectedRoute>
              <AdminReportDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Public Routes */}
          <Route path="*" element={
            <>
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/submit" element={<SubmitReportPage />} />
                  <Route path="/check-status" element={<CheckStatusPage />} />
                  <Route path="/reports/:id" element={<ReportDetailPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
