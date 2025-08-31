import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductosMasReservadosChart = ({ productos }) => {
  const data = {
    labels: productos.map(p => p.nombre_producto),
    datasets: [
      {
        label: 'Cantidad Reservada',
        data: productos.map(p => p.total_reservado),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top 5 Productos Más Reservados' },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ maxWidth: '700px', height: '350px', margin: '2rem auto' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProductosMasReservadosChart;
