import React, { useState, useEffect } from 'react';
import { processReward, getRewardBalance } from '../api/investigator';
import { toast } from 'react-toastify';
import { hasRole } from '../services/auth';

const RewardForm = ({ reportId, rewardWallet, onReward }) => {
  const [rewardNote, setRewardNote] = useState('');
  const [rewardAmount, setRewardAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);
  const isManagement = hasRole('management');
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getRewardBalance();
        setBalance(data.balance);
      } catch (err) {
        console.error("Failed to fetch reward balance:", err);
      }
    };
    
    if (isManagement) {
      fetchBalance();
    }
  }, [isManagement]);
  
  if (!isManagement || !rewardWallet) {
    return null;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rewardNote.trim() || isNaN(rewardAmount) || rewardAmount <= 0 || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const result = await processReward(reportId, rewardNote.trim(), Number(rewardAmount));
      setBalance(result.currentBalance);
      toast.success('Reward processed successfully');
      
      if (onReward) {
        onReward(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to process reward');
      toast.error('Failed to process reward');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="reward-form">
      <h3>Process Reward</h3>
      <p>Wallet address: <span className="wallet-address">{rewardWallet}</span></p>
      <p>Available balance: <span className="balance">{balance} BTC</span></p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reward-amount">Reward Amount</label>
          <input
            id="reward-amount"
            type="number"
            min="1"
            max={balance}
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="reward-note">Note for Whistleblower</label>
          <textarea
            id="reward-note"
            value={rewardNote}
            onChange={(e) => setRewardNote(e.target.value)}
            placeholder="Add a note explaining the reward..."
            disabled={isSubmitting}
            rows="3"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={!rewardNote.trim() || rewardAmount <= 0 || rewardAmount > balance || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Send Reward'}
        </button>
      </form>
    </div>
  );
};

export default RewardForm;
