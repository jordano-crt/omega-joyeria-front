const API_URL = 'http://localhost:4000/disponibilidad';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.message || 'Ocurrió un error';
    throw new Error(error);
  }
  return data;
};

// ===============================
// FUNCIONES PARA ADMINISTRADORES
// ===============================

// Crear nueva disponibilidad (solo admin)
export const crearDisponibilidad = async (disponibilidadData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(disponibilidadData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear disponibilidad:', error);
    throw error;
  }
};

// Obtener todas las disponibilidades (solo admin)
export const obtenerDisponibilidadesAdmin = async (params = {}) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });

    const url = `${API_URL}/admin${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener disponibilidades:', error);
    throw error;
  }
};

// Actualizar disponibilidad (solo admin)
export const actualizarDisponibilidad = async (id, disponibilidadData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(disponibilidadData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    throw error;
  }
};

// Eliminar disponibilidad (solo admin)
export const eliminarDisponibilidad = async (id) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    throw error;
  }
};

// Obtener disponibilidades por rango de fechas (solo admin)
export const obtenerDisponibilidadesPorRango = async (fechaInicio, fechaFin) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/admin/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener disponibilidades por rango:', error);
    throw error;
  }
};

// ===============================
// FUNCIONES PÚBLICAS PARA USUARIOS
// ===============================

// Obtener disponibilidades públicas (para usuarios)
export const obtenerDisponibilidadesPublicas = async () => {
  try {
    const response = await fetch(`${API_URL}/publicas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener disponibilidades públicas:', error);
    throw error;
  }
};

// Obtener disponibilidades públicas incluyendo slot de una cita específica (para edición)
export const obtenerDisponibilidadesPublicasConCita = async (citaId = null) => {
  try {
    const url = citaId 
      ? `${API_URL}/publicas-con-cita?citaId=${citaId}`
      : `${API_URL}/publicas`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener disponibilidades públicas con cita:', error);
    throw error;
  }
};

// ===============================
// UTILIDADES
// ===============================

// Formatear fecha para mostrar
export const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  try {
    // Si la fecha viene como string, asegurar que esté en formato correcto
    const fechaObj = new Date(fecha);
    
    // Verificar si la fecha es válida
    if (isNaN(fechaObj.getTime())) {
      console.error('Fecha inválida:', fecha);
      return 'Fecha inválida';
    }
    
    // Formatear usando toLocaleDateString para evitar problemas de timezone
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error, fecha);
    return 'Fecha inválida';
  }
};

// Formatear hora para mostrar
export const formatearHora = (hora) => {
  if (!hora) return 'Hora no disponible';
  
  try {
    // Si la hora viene en formato HH:MM:SS, tomar solo HH:MM
    if (typeof hora === 'string') {
      const horaParts = hora.split(':');
      if (horaParts.length >= 2) {
        return `${horaParts[0]}:${horaParts[1]}`;
      }
    }
    
    // Si viene como objeto Date
    if (hora instanceof Date) {
      return hora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return hora.toString();
  } catch (error) {
    console.error('Error al formatear hora:', error, hora);
    return 'Hora inválida';
  }
};

// Agrupar disponibilidades por fecha
export const agruparPorFecha = (disponibilidades) => {
  return disponibilidades.reduce((acc, disponibilidad) => {
    const fecha = disponibilidad.fecha;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(disponibilidad);
    return acc;
  }, {});
};
