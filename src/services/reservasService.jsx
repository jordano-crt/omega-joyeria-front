const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      const error = data.message || 'Ocurrió un error';
      throw new Error(error);
    }
    return data;
  } else {
    const text = await response.text();
    console.error('Respuesta no JSON recibida:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      text: text.substring(0, 200)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}. El servidor devolvió HTML en lugar de JSON.`);
    }
    
    return { message: 'Operación completada' };
  }
};

// Obtener token desde localStorage o sessionStorage

const getToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log("Token usado:", token);
  return token;
};


// Obtener stock actualizado de un producto
export const obtenerStock = async (productoId) => {
  try {
    const response = await fetch(`${API_URL}/productos/stock/${productoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al obtener stock:', error);
    throw error;
  }
};

// Reservar producto
export const reservarProducto = async (productoId, cantidad, tiempoExpiracion = 30) => {
  const token = getToken();

  if (!token) {
    throw new Error('Debes iniciar sesión para reservar productos');
  }

  try {
    const response = await fetch(`${API_URL}/reservas/producto/${productoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        cantidad, 
        tiempo_expiracion: tiempoExpiracion 
      }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al reservar producto:', error);
    throw error;
  }
};

// Cancelar reserva
export const cancelarReserva = async (reservaId) => {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/reservas/cancelar/${reservaId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    throw error;
  }
};

// Confirmar reserva
export const confirmarReserva = async (reservaId) => {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    console.log(`Confirmando reserva en: ${API_URL}/reservas/confirmar/${reservaId}`);

    const response = await fetch(`${API_URL}/reservas/confirmar/${reservaId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    throw error;
  }
};

// Obtener reservas activas del usuario
export const obtenerReservasActivas = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/reservas/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al obtener reservas activas:', error);
    throw error;
  }
};