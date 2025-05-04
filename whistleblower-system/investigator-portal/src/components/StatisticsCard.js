import React from 'react';

const StatisticsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stat-card">
      <div className="icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="title">{title}</div>
      <div className="value">{value}</div>
    </div>
  );
};

export default StatisticsCard;
