import React, { useEffect, useState } from 'react';
import ReservasChart from '../../components/ReservasChart';
import ProductosMasReservadosChart from '../../components/ProductosMasReservadosChart';
import IngresosMensualesChart from '../../components/IngresosMensualesChart';

const KpiPanel = () => {
  const [kpis, setKpis] = useState(null);
  const [reservasMensuales, setReservasMensuales] = useState(null);
  const [productosTop, setProductosTop] = useState(null);
  const [ingresosMensuales, setIngresosMensuales] = useState(null);

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    // Fetch KPIs básicos
    const fetchKpis = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/kpi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener KPIs');
        const data = await res.json();
        setKpis(data);
      } catch (error) {
        console.error('Error al cargar KPIs:', error);
      }
    };

    // Fetch reservas mensuales para gráfico
    const fetchReservasMensuales = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/kpi/reservas-mensuales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener datos del gráfico reservas');
        const data = await res.json();
        setReservasMensuales(data);
      } catch (error) {
        console.error('Error al cargar gráfico reservas:', error);
      }
    };

    /*/* Fetch productos más reservados para gráfico
    const fetchProductosTop = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/kpi/productos-mas-reservados', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener datos productos top');
        const data = await res.json();
        setProductosTop(data);
      } catch (error) {
        console.error('Error al cargar gráfico productos top:', error);
      }
    };

    // Fetch ingresos mensuales para gráfico
    const fetchIngresosMensuales = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/kpi/ingresos-mensuales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener ingresos mensuales');
        const data = await res.json();
        setIngresosMensuales(data);
      } catch (error) {
        console.error('Error al cargar gráfico ingresos:', error);
      }
    };
    */
    fetchKpis();
    fetchReservasMensuales();
    //fetchProductosTop();
    //fetchIngresosMensuales();
  }, [token]);

  if (!kpis) return <p className="p-4">Cargando KPIs...</p>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Panel de KPIs</h1>

      {/* KPIs básicos */}
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

      {/* Otros KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-purple-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Eventos</h2>
          <p className="text-3xl">{kpis.total_eventos}</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Servicios</h2>
          <p className="text-3xl">{kpis.total_servicios}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {reservasMensuales && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4"></h2>
            <ReservasChart meses={reservasMensuales.meses} valores={reservasMensuales.valores} />
          </div>
        )}

        {productosTop && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Productos Más Reservados</h2>
            <ProductosMasReservadosChart productos={productosTop.productos} cantidades={productosTop.cantidades} />
          </div>
        )}

        {ingresosMensuales && (
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Ingresos Mensuales</h2>
            <IngresosMensualesChart ingresos={ingresosMensuales.ingresos} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiPanel;
