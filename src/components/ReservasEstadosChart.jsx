import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar los componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const ReservasEstadosChart = ({ chartData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 14,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (!chartData || !chartData.labels || !chartData.datasets) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Estados de Reservas</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Estados de Reservas</h3>
      <div className="h-80 flex items-center justify-center">
        <Pie data={chartData} options={options} />
      </div>
      
      {/* Resumen numérico */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {chartData.labels.map((label, index) => (
          <div key={label} className="flex flex-col items-center">
            <div 
              className="w-4 h-4 rounded-full mb-1"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
            ></div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-lg font-bold text-gray-900">
              {chartData.datasets[0].data[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservasEstadosChart;