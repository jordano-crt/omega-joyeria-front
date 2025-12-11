// Servicio para gestión de usuarios por administradores
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/usuarios';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.message || 'Ocurrió un error';
    throw new Error(error);
  }
  return data;
};

// Actualizar usuario completo (solo admin)
export const actualizarUsuarioAdmin = async (userId, userData) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Obtener todos los usuarios (admin)
export const obtenerTodosLosUsuarios = async (filters = {}) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const params = new URLSearchParams();
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.rol && filters.rol !== 'all') params.append('rol', filters.rol);

    const response = await fetch(`${API_URL}/all?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Eliminar usuario (admin)
export const eliminarUsuario = async (userId) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

// Actualizar rol de usuario (admin)
export const actualizarRolUsuario = async (userId, rolId) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('Token no encontrado');

  try {
    const response = await fetch(`${API_URL}/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify({ rol_id: parseInt(rolId) }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};
