import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsChart = ({ data }) => {
  // Format data for chart
  const chartData = [
    {
      name: 'Pending',
      value: data.byStatus.pending,
      fill: '#fdcb6e'
    },
    {
      name: 'Under Investigation',
      value: data.byStatus.under_investigation,
      fill: '#74b9ff'
    },
    {
      name: 'Completed',
      value: data.byStatus.completed,
      fill: '#55efc4'
    }
  ];
  
  const criticalityData = [
    {
      name: 'Low',
      value: data.byCriticality.low,
      fill: '#55efc4'
    },
    {
      name: 'Medium',
      value: data.byCriticality.medium,
      fill: '#fdcb6e'
    },
    {
      name: 'High',
      value: data.byCriticality.high,
      fill: '#e74c3c'
    }
  ];
  
  return (
    <div className="statistics-charts">
      <div className="chart-container">
        <h3>Reports by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Reports" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-container">
        <h3>Reports by Criticality</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={criticalityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Reports" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsChart;
