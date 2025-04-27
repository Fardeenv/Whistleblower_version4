import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
