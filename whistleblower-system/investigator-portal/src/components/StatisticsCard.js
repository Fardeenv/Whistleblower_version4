import React from 'react';

const StatisticsCard = ({ title, value, icon, color }) => {
  return (
    <div className="statistics-card" style={{ borderTopColor: color }}>
      <div className="card-icon" style={{ backgroundColor: color, color: 'white' }}>
        {icon}
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
};

export default StatisticsCard;
