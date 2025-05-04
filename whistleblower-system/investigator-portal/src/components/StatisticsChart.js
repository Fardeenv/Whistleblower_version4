import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const StatisticsChart = ({ data }) => {
  // Return empty container if no data
  if (!data) return <div className="statistics-chart"></div>;
  
  const chartData = {
    labels: ['Pending', 'Under Investigation', 'Completed'],
    datasets: [
      {
        label: 'Reports',
        data: [
          data.byStatus.pending,
          data.byStatus.under_investigation,
          data.byStatus.completed
        ],
        backgroundColor: [
          'rgba(253, 203, 110, 0.8)',
          'rgba(116, 185, 255, 0.8)',
          'rgba(85, 239, 196, 0.8)'
        ],
        borderColor: [
          'rgb(243, 156, 18)',
          'rgb(52, 152, 219)',
          'rgb(0, 184, 148)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Reports by Status',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  return (
    <div className="statistics-chart">
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StatisticsChart;
