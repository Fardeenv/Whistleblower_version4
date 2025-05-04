import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import MyCases from './pages/MyCases';
import ReportDetail from './components/ReportDetail';
import { isAuthenticated, hasRole } from './services/auth';

const PrivateRoute = ({ children, role }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  if (role && !hasRole(role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-cases"
        element={
          <PrivateRoute role="investigator">
            <MyCases />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports/:maskedId"
        element={
          <PrivateRoute>
            <ReportDetail />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
