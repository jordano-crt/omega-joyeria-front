import React, { useEffect, useState } from 'react';
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

// Registrar los componentes
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReservasChart = () => {
  const [chartData, setChartData] = useState(null);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/kpi/reservas-mensuales', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener datos');

        const data = await res.json();

        setChartData({
          labels: data.meses,
          datasets: [
            {
              label: 'Reservas Confirmadas por Mes',
              data: data.valores,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
          ],
        });
      } catch (error) {
        console.error('Error al cargar gráfico:', error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) return <p className="p-4">Cargando gráfico...</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Reservas Mensuales</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Reservas Confirmadas (últimos 12 meses)' },
          },
        }}
      />
    </div>
  );
};

export default ReservasChart;

