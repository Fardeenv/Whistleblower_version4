import React, { useState } from 'react';
import ReportForm from '../components/ReportForm';
import { toast } from 'react-toastify';

const SubmitReportPage = () => {
  const [submittedReport, setSubmittedReport] = useState(null);
  
  const handleSubmitSuccess = (report) => {
    setSubmittedReport(report);
    window.scrollTo(0, 0);
    toast.success('Report submitted successfully!');
  };
  
  return (
    <div className="submit-report-page container">
      {submittedReport ? (
        <div className="success-message">
          <h2>Report Submitted Successfully</h2>
          <p>Your report has been securely recorded on the blockchain.</p>
          
          <div className="report-id-box">
            <p><strong>Your Report ID:</strong></p>
            <p className="id">{submittedReport.id}</p>
            <p><strong>Important:</strong> Please save this ID to check your report status and communicate with investigators.</p>
          </div>
          
          {submittedReport.rewardWallet && (
            <div className="reward-info">
              <p>If your report leads to successful action, a reward will be sent to your provided wallet address.</p>
            </div>
          )}
          
          <button 
            onClick={() => setSubmittedReport(null)}
            className="submit-another"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <ReportForm onSubmitSuccess={handleSubmitSuccess} />
      )}
    </div>
  );
};

export default SubmitReportPage;
