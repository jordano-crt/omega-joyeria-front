const API_URL = 'http://localhost:4000/testimonios'; // Cambia el endpoint si es necesario

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.message || 'Ocurrió un error';
    throw new Error(error);
  }
  return data;
};

// Obtener todas las reseñas aprobadas
export const obtenerTestimonios = async (params = {}) => {
  try {
    // Construir URL con parámetros
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    
    const url = `${API_URL}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Si tenemos un filtro por usuario específico, enviamos el token
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (params.usuario_id) {
      const token = sessionStorage.getItem('token');
      if (token) {
        headers['x-auth-token'] = token;
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener testimonios:', error);
    throw error;
  }
};


// Crear un nuevo testimonio
export const crearTestimonio = async (testimonioData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(testimonioData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear testimonio:', error);
    throw error;
  }
};

// Obtener testimonios del usuario autenticado
export const obtenerMisTestimonios = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/mis-testimonios`, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener tus testimonios:', error);
    throw error;
  }
};

// Actualizar un testimonio
export const actualizarTestimonio = async (id, testimonioData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(testimonioData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar el testimonio:', error);
    throw error;
  }
};

// Eliminar un testimonio
export const eliminarTestimonio = async (id) => {
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
    console.error('Error al eliminar el testimonio:', error);
    throw error;
  }
};
