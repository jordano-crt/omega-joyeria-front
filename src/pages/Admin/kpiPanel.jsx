import React, { useEffect, useState } from 'react';
import ReservasChart from '../../components/ReservasChart';

const KpiPanel = () => {
  const [kpis, setKpis] = useState(null);
  const [reservasMensuales, setReservasMensuales] = useState(null);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    // Fetch KPIs generales
    const fetchKpis = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/kpi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener los KPIs');
        const data = await res.json();
        setKpis(data);
      } catch (error) {
        console.error('Error al cargar KPIs:', error);
      }
    };

    // Fetch datos para gráfico reservas mensuales
    const fetchReservasMensuales = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/kpi/reservas-mensuales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener datos del gráfico');
        const data = await res.json();
        setReservasMensuales(data);
      } catch (error) {
        console.error('Error al cargar gráfico:', error);
      }
    };

    fetchKpis();
    fetchReservasMensuales();
  }, [token]);

  if (!kpis || !reservasMensuales) {
    return <p className="p-4">Cargando KPIs...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Panel de KPIs</h1>

      {/* Resumen básico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Usuarios</h2>
          <p className="text-3xl">{kpis.total_usuarios}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Reservas Confirmadas</h2>
          <p className="text-3xl">{kpis.reservas_confirmadas}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Citas Agendadas</h2>
          <p className="text-3xl">{kpis.citas_agendadas}</p>
        </div>
      </div>

      {/* Gráfico de reservas con datos */}
      <ReservasChart meses={reservasMensuales.meses} valores={reservasMensuales.valores} />
    </div>
  );
};

export default KpiPanel;
