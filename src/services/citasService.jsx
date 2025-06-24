const API_URL = 'http://localhost:4000';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.message || 'Ocurrió un error';
    throw new Error(error);
  }
  return data;
};

// Obtener todas las citas del usuario
export const getCitas = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/citas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token, // Enviamos ambos para compatibilidad
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    throw error;
  }
};

// Crear una nueva cita
export const createCita = async (citaData) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: JSON.stringify(citaData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error al crear la cita:', error);
    throw error;
  }
};

// Actualizar una cita
export const updateCita = async (citaId, citaData) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/citas/${citaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: JSON.stringify(citaData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar la cita:', error);
    throw error;
  }
};

// Eliminar una cita
export const deleteCita = async (citaId) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/citas/${citaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar la cita:', error);
    throw error;
  }
};

// Obtener fechas ocupadas
export const getFechasOcupadas = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/citas/ocupadas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error al obtener las fechas ocupadas:', error);
    throw error;
  }
};
