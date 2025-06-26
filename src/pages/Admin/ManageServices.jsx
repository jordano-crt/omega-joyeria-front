import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageServices = () => {
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const token = localStorage.getItem('token'); // Usa tu lógica de auth
        const response = await axios.get('http://localhost:4000/servicios', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setServicios(response.data);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      }
    };

    fetchServicios();
  }, []);

  return (
    <div>
      <h1>Gestión de Servicios</h1>
      <ul>
        {servicios.map((servicio) => (
          <li key={servicio.id}>{servicio.nombre}</li>
        ))}
      </ul>
    </div>
  );
};

export default ManageServices;
