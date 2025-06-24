const API_URL = 'http://localhost:4000/citas';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.message || 'Ocurrió un error';
    throw new Error(error);
  }
  return data;
};

// Crear una nueva cita con disponibilidad
export const crearCita = async (citaData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(citaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear cita:', error);
    throw error;
  }
};

// Obtener citas del usuario autenticado
export const obtenerCitas = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    throw error;
  }
};

// Función legacy para compatibilidad (redirects to obtenerCitas)
export const getCitas = async () => {
  return await obtenerCitas();
};

// Obtener todas las citas (solo admin)
export const obtenerTodasLasCitas = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/admin/todas`, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    throw error;
  }
};

// Actualizar una cita
export const actualizarCita = async (id, citaData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(citaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    throw error;
  }
};

// Función legacy para compatibilidad
export const updateCita = async (id, citaData) => {
  return await actualizarCita(id, citaData);
};

// Eliminar una cita
export const eliminarCita = async (id) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  console.log("🔧 DEBUG SERVICE - eliminarCita iniciado con id:", id);

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
    
    console.log("🔧 DEBUG SERVICE - Response status:", response.status);
    console.log("🔧 DEBUG SERVICE - Response ok:", response.ok);
    
    const result = await handleResponse(response);
    console.log("🔧 DEBUG SERVICE - eliminarCita exitoso:", result);
    return result;
  } catch (error) {
    console.error('🔧 DEBUG SERVICE - Error al eliminar cita:', error);
    throw error;
  }
};

// Función legacy para compatibilidad
export const deleteCita = async (id) => {
  return await eliminarCita(id);
};

// Eliminar una cita como administrador
export const eliminarCitaAdmin = async (id) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar cita como admin:', error);
    throw error;
  }
};

// Crear una cita como administrador (para cualquier usuario)
export const crearCitaAdmin = async (citaData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/admin/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(citaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear cita como admin:', error);
    throw error;
  }
};

// Actualizar una cita como administrador
export const actualizarCitaAdmin = async (id, citaData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(citaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar cita como admin:', error);
    throw error;
  }
};

// Obtener todas las citas (admin)
export const obtenerTodasLasCitasAdmin = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/admin/todas`, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    throw error;
  }
};

// Obtener servicios disponibles
export const obtenerServicios = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch('http://localhost:4000/servicios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    throw error;
  }
};

// Función legacy para compatibilidad
export const getServicios = async () => {
  return await obtenerServicios();
};

// Utilidades para formato
export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatearHora = (hora) => {
  return hora?.substring(0, 5) || ''; // HH:MM
};

export const formatearFechaHora = (fechaHora) => {
  const fecha = new Date(fechaHora);
  return {
    fecha: formatearFecha(fecha),
    hora: fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
};
