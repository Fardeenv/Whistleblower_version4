import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SubmitReportPage from './pages/SubmitReportPage';
import CheckStatusPage from './pages/CheckStatusPage';
import ReportDetailPage from './pages/ReportDetailPage';

function App() {
  return (
    <Router>
      <div className="app">
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
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </Router>
  );
}

export default App;
