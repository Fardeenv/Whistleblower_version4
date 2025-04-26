import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getReportById } from '../api/whistleblower';

const ReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportById(id);
        setReport(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message container">{error}</div>;
  }

  if (!report) {
    return <div className="not-found container">Report not found</div>;
  }

  return (
    <div className="container">
      <div className="report-detail">
        <h2>Report Details</h2>
        
        <div className="status-badge">
          Status: <span className={`status-${report.status}`}>{report.status}</span>
        </div>
        
        <div className="report-info">
          <h3>{report.title}</h3>
          <p className="report-meta">
            Submitted on {report.date} by {report.submitter}
          </p>
          <div className="report-description">
            <h4>Description:</h4>
            <p>{report.description}</p>
          </div>
        </div>
        
        <div className="report-id">
          <strong>Report ID:</strong> {report.id}
        </div>
        
        <p className="help-text">
          Please save this Report ID for future reference.
        </p>
      </div>
    </div>
  );
};

export default ReportDetailPage;
