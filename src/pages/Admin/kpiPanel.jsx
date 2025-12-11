import React, { useEffect, useState } from 'react';
import ReservasChart from '../../components/ReservasChart';
import ReservasEstadosChart from '../../components/ReservasEstadosChart';
import { Bounce, toast } from 'react-toastify';

const KpiPanel = () => {
  const [kpis, setKpis] = useState(null);
  const [reservasMensuales, setReservasMensuales] = useState(null);
  const [reservasEstados, setReservasEstados ] = useState(null);

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    let isCancelled = false; // Flag para cancelar si el componente se desmonta

    // Fetch KPIs generales
    const fetchKpis = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/admin/kpi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener los KPIs');
        const data = await res.json();
        
        if (!isCancelled) { // Solo ejecutar si no se canceló
          setKpis(data);
          toast.success("KPIs cargados correctamente", {
            position: "top-right",
            theme: "colored"
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error al cargar KPIs:', error);
          toast.error("Error al cargar KPIs", {
            position: "top-right",
            theme: "colored"
          });
        }
      }
    };

    // Fetch datos para gráfico reservas mensuales
    const fetchReservasMensuales = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/admin/kpi/reservas-mensuales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener datos del gráfico');
        const data = await res.json();
        
        if (!isCancelled) {
          setReservasMensuales(data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error al cargar gráfico:', error);
        }
      }
    };
    
    const fetchReservasEstados = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/admin/kpi/reservas-estados', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener datos del gráfico');
        const data = await res.json();

        // console.log("🔍 Datos de estados de reservas:", data);
        
        if (!isCancelled) {
          setReservasEstados(data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error al cargar gráfico:', error);
        }
      }
    };

    fetchKpis();
    fetchReservasMensuales();
    fetchReservasEstados();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [token]);

  if (!kpis || !reservasMensuales || !reservasEstados) {
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de reservas mensuales */}
        <div>
          <ReservasChart meses={reservasMensuales.meses} valores={reservasMensuales.valores} />
        </div>
        
        {/* Gráfico de estados de reservas */}
        <div>
          <ReservasEstadosChart chartData={reservasEstados} />
        </div>
      </div>
    </div>
  );


};

export default KpiPanel;
