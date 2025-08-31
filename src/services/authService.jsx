const API_URL = 'http://localhost:4000'; // Cambiar a HTTPS en producción 

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.message || 'Ocurrió un error';
    throw new Error(error);
  }
  return data;
};

// Registro de usuario
export const register = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/register`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error en el registro:', error);
    throw error;
  }
};

// Inicio de sesión
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const userData = await handleResponse(response); // Procesa la respuesta
    console.log("Datos del usuario recibidos desde el backend:", userData); // Log para verificar
    return userData; // Devuelve todos los campos, incluyendo usuario_id
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    throw error;
  }
};

// Obtener perfil
export const getProfile = async () => {
  const token = sessionStorage.getItem('token'); // Obtener el token desde sessionStorage
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/usuarios/perfil`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token, // Enviar el token en el header
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
};

// Actualizar perfil
export const updateProfile = async (profileData) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/usuarios/perfil`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json', // Asegurarse de que los datos se envían como JSON
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
};

// Eliminar Cuenta
export const deleteAccount = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/usuarios/eliminar`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token, // Asegúrate de enviar el token de autenticación
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    throw error;
  }
};
