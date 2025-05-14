// Simple in-memory management of reward balance for demo purposes
let rewardBalance = process.env.MANAGEMENT_REWARD_BALANCE || 1000;

/**
 * Get current reward balance
 * @returns {number} - Current reward balance
 */
const getRewardBalance = () => {
  return Number(rewardBalance);
};

/**
 * Deduct reward from balance
 * @param {number} amount - Amount to deduct
 * @returns {boolean} - Success status
 */
const deductReward = (amount) => {
  const amountNum = Number(amount);
  
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Invalid reward amount');
  }
  
  if (amountNum > rewardBalance) {
    throw new Error('Insufficient reward balance');
  }
  
  rewardBalance -= amountNum;
  return true;
};

/**
 * Add reward to balance (for testing purposes)
 * @param {number} amount - Amount to add
 * @returns {boolean} - Success status
 */
const addReward = (amount) => {
  const amountNum = Number(amount);
  
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Invalid reward amount');
  }
  
  rewardBalance += amountNum;
  return true;
};

module.exports = {
  getRewardBalance,
  deductReward,
  addReward
};
