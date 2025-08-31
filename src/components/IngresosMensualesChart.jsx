import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const IngresosMensualesChart = ({ ingresos }) => {
  const data = {
    labels: ingresos.map(i => i.mes),
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: ingresos.map(i => parseFloat(i.ingresos)),
        borderColor: 'rgba(54, 162, 235, 0.8)',
        backgroundColor: 'rgba(54, 162, 235, 0.4)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Ingresos Confirmados por Mes (últimos 12 meses)' },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ maxWidth: '700px', height: '350px', margin: '2rem auto' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default IngresosMensualesChart;
