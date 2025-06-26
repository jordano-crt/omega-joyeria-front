// Servicio para gestión de testimonios como administrador
const API_BASE_URL = 'http://localhost:4000';

// Obtener todas las reseñas (no solo pendientes)
export const obtenerTodasLasReseñas = async (token) => {
  const response = await fetch(`${API_BASE_URL}/testimonios`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener las reseñas');
  }

  return await response.json();
};

// Obtener reseñas pendientes
export const obtenerReseñasPendientes = async (token) => {
  const response = await fetch(`${API_BASE_URL}/testimonios/pendientes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener las reseñas pendientes');
  }

  return await response.json();
};

// Aceptar una reseña
export const aceptarReseña = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/testimonios/${id}/aceptar`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al aceptar la reseña');
  }

  return await response.json();
};

// Rechazar una reseña
export const rechazarReseña = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/testimonios/${id}/rechazar`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al rechazar la reseña');
  }

  return await response.json();
};

// Eliminar una reseña como administrador
export const eliminarReseñaAdmin = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/testimonios/${id}/admin`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar la reseña');
  }

  return await response.json();
};
