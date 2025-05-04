import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ReportForm from './components/ReportForm';
import ReportStatus from './components/ReportStatus';
import ReportDetailPage from './pages/ReportDetailPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/submit" element={<ReportForm />} />
      <Route path="/status" element={<ReportStatus />} />
      <Route path="/reports/:id" element={<ReportDetailPage />} />
    </Routes>
  );
};

export default AppRoutes;
