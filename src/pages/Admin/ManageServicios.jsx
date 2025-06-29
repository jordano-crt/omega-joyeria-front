import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../services/authContext";

const ManageServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre_servicio: "",
    descripcion: "",
    precio: "",
    duracion_estimada: ""
  });

  const { token, user } = useContext(AuthContext);

  // Función para obtener solicitudes de servicios (personalizaciones)
  const fetchServiceRequests = async () => {
    setLoadingRequests(true);
    try {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://localhost:4000/personalizacion', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener solicitudes de servicios');
      }

      const data = await response.json();
      console.log('Solicitudes de servicios obtenidas:', data);
      // El endpoint devuelve directamente el array de solicitudes
      setServiceRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error en fetchServiceRequests:', error);
      setError(error.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Función para obtener servicios
  const fetchServicios = async () => {
    setLoading(true);
    try {
      console.log('Token disponible:', token ? 'Sí' : 'No');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://localhost:4000/servicios', {
        headers: {
          'x-auth-token': token,
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener servicios');
      }

      const data = await response.json();
      console.log('Servicios obtenidos:', data);
      setServicios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error en fetchServicios:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar servicios al montar el componente
  useEffect(() => {
    if (!token || !user) {
      setError('Debes iniciar sesión como administrador para acceder a esta página');
      setLoading(false);
      return;
    }
    
    // Convertir rol_id a número para comparación
    const rolId = parseInt(user.rol_id);
    if (rolId !== 2) {
      setError('No tienes permisos de administrador para acceder a esta página');
      setLoading(false);
      return;
    }

    fetchServicios();
  }, [token, user]);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    // Prevenir cualquier validación del navegador
    e.preventDefault();
    e.stopPropagation();
    
    // Para navegadores que no soportan preventDefault correctamente
    if (e.nativeEvent) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }
    
    try {
      // Validaciones adicionales
      if (!formData.nombre_servicio || !formData.nombre_servicio.trim()) {
        throw new Error('El nombre del servicio es obligatorio');
      }
      
      if (!formData.descripcion || !formData.descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }

      // Validar precio - permitir formato con coma o punto decimal
      if (!formData.precio || !formData.precio.trim()) {
        throw new Error('El precio es obligatorio');
      }
      
      let precioStr = formData.precio.trim().replace(',', '.');
      const precio = parseFloat(precioStr);
      if (isNaN(precio) || precio <= 0) {
        throw new Error('El precio debe ser un número mayor a 0');
      }

      // Validar duración (opcional)
      let duracion = null;
      if (formData.duracion_estimada && formData.duracion_estimada.trim() !== '') {
        const duracionNum = parseInt(formData.duracion_estimada.trim());
        if (isNaN(duracionNum) || duracionNum <= 0) {
          throw new Error('La duración debe ser un número entero mayor a 0');
        }
        duracion = duracionNum;
      }

      const url = editingServicio 
        ? `http://localhost:4000/servicios/${editingServicio.servicio_id}`
        : 'http://localhost:4000/servicios';
        
      const method = editingServicio ? 'PUT' : 'POST';
      
      const bodyData = {
        nombre_servicio: formData.nombre_servicio.trim(),
        descripcion: formData.descripcion.trim(),
        precio: precio,
        duracion_estimada: duracion
      };

      console.log('Enviando datos:', bodyData); // Para debugging

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar servicio');
      }

      await fetchServicios();
      resetForm();
      setError("");
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      setError(error.message);
    }
  };

  // Manejar edición
  const handleEdit = (servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre_servicio: servicio.nombre_servicio || '',
      descripcion: servicio.descripcion || '',
      precio: servicio.precio ? servicio.precio.toString() : '',
      duracion_estimada: servicio.duracion_estimada ? servicio.duracion_estimada.toString() : ''
    });
    setShowForm(true);
    setError(''); // Limpiar errores previos
  };

  // Manejar eliminación
  const handleDelete = async (servicioId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      try {
        const response = await fetch(`http://localhost:4000/servicios/${servicioId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar servicio');
        }

        await fetchServicios();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Función para actualizar el estado de una solicitud de personalización
  const handleUpdateSolicitudStatus = async (solicitudId, nuevoEstado) => {
    try {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`http://localhost:4000/personalizacion/${solicitudId}/${nuevoEstado}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${nuevoEstado} la solicitud`);
      }

      // Actualizar la lista de solicitudes
      await fetchServiceRequests();
      
      // Mostrar mensaje de éxito
      alert(`Solicitud ${nuevoEstado === 'aceptar' ? 'aceptada' : 'rechazada'} exitosamente`);
    } catch (error) {
      console.error('Error al actualizar estado de solicitud:', error);
      setError(error.message);
    }
  };

  // Manejar cambios en los inputs con validación en tiempo real
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error si el usuario está escribiendo
    if (error) {
      setError('');
    }
  };
  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre_servicio: "",
      descripcion: "",
      precio: "",
      duracion_estimada: ""
    });
    setShowForm(false);
    setEditingServicio(null);
    setError("");
  };

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Gestión de Servicios
        </h1>

        {/* Botones de navegación */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            <button
              onClick={() => {
                setShowRequests(false);
                setShowForm(false);
              }}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                !showRequests
                  ? 'bg-sgreen text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Gestionar Servicios
            </button>
            <button
              onClick={() => {
                setShowRequests(true);
                setShowForm(false);
                fetchServiceRequests();
              }}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                showRequests
                  ? 'bg-sgreen text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ver Solicitudes
            </button>
          </div>
        </div>



        {/* Verificar si el usuario está autenticado y es admin */}
        {(!token || !user) ? (
          <div className="text-center text-red-600">
            <p>Debes iniciar sesión como administrador para acceder a esta página.</p>
          </div>
        ) : user.rol_id !== 2 ? (
          <div className="text-center text-red-600">
            <p>No tienes permisos de administrador para acceder a esta página.</p>
          </div>
        ) : (
          <>
            {!showRequests ? (
              // Vista de gestión de servicios
              <>
                {/* Botón para crear nuevo servicio */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
                  >
                    {showForm ? "Cancelar" : "Nuevo Servicio"}
                  </button>
                </div>

                {/* Mensajes de error */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                {/* Formulario para crear/editar servicio */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white p-6 rounded-2xl shadow-sm mb-6"
                    >
                      <h2 className="text-xl font-semibold mb-4">
                        {editingServicio ? "Editar Servicio" : "Nuevo Servicio"}
                      </h2>
                      
                      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Servicio *
                          </label>
                          <input
                            type="text"
                            value={formData.nombre_servicio}
                            onChange={(e) => handleInputChange('nombre_servicio', e.target.value)}
                            maxLength="255"
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Ej: Reparación de reloj"
                            autoComplete="off"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio ($) *
                          </label>
                          <input
                            type="text"
                            value={formData.precio}
                            onChange={(e) => handleInputChange('precio', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0.00"
                            autoComplete="off"
                            inputMode="decimal"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duración (minutos)
                          </label>
                          <input
                            type="text"
                            value={formData.duracion_estimada}
                            onChange={(e) => handleInputChange('duracion_estimada', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="60"
                            autoComplete="off"
                            inputMode="numeric"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción *
                          </label>
                          <textarea
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                            rows={3}
                            maxLength="1000"
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Describe el servicio en detalle..."
                            autoComplete="off"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.descripcion.length}/1000 caracteres
                          </p>
                        </div>

                        <div className="md:col-span-2 flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={resetForm}
                            className="py-2 px-4 text-sm border-2 rounded-lg bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="py-2 px-4 text-sm border-2 rounded-lg bg-sgreen text-white border-green-500 hover:bg-green-600"
                          >
                            {editingServicio ? "Actualizar" : "Crear"}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Lista de servicios */}
                {loading ? (
                  <p className="text-center text-gray-600">Cargando servicios...</p>
                ) : servicios.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p>No hay servicios configurados.</p>
                    <p className="mt-2 text-sm">Crea el primer servicio para empezar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicios.map((servicio) => (
                      <motion.div
                        key={servicio.servicio_id}
                        className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-gray-800">
                            {servicio.nombre_servicio}
                          </h3>
                          <span className="text-lg font-bold text-green-600">
                            ${servicio.precio}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">
                          {servicio.descripcion}
                        </p>

                        {servicio.duracion_estimada && (
                          <p className="text-gray-500 text-xs mb-4">
                            <span className="font-medium">Duración:</span> {servicio.duracion_estimada} minutos
                          </p>
                        )}

                        <div className="flex justify-between">
                          <button
                            onClick={() => handleEdit(servicio)}
                            className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-600 transition duration-300"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(servicio.servicio_id)}
                            className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition duration-300"
                          >
                            Eliminar
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Vista de solicitudes de servicios
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Solicitudes de Servicios
                  </h2>
                  <button
                    onClick={fetchServiceRequests}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Actualizar
                  </button>
                </div>

                {/* Mensajes de error para solicitudes */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                {loadingRequests ? (
                  <p className="text-center text-gray-600 py-8">Cargando solicitudes...</p>
                ) : serviceRequests.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No hay solicitudes de servicios.</p>
                    <p className="mt-2 text-sm">Las citas solicitadas aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Servicio
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha Solicitud
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Detalles
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {serviceRequests.map((request) => (
                          <tr key={request.solicitud_id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.nombre || 'N/A'} {request.apellido_paterno || ''} {request.apellido_materno || ''}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {request.usuario_id}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.nombre_servicio || 'Servicio no especificado'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {request.fecha_solicitud ? new Date(request.fecha_solicitud).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                request.nombre_estado === 'Confirmado' ? 'bg-green-100 text-green-800' :
                                request.nombre_estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                request.nombre_estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.nombre_estado || 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {request.detalles || 'Sin detalles'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {request.nombre_estado === 'Pendiente' ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateSolicitudStatus(request.solicitud_id, 'aceptar')}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                                  >
                                    Aceptar
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSolicitudStatus(request.solicitud_id, 'rechazar')}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  {request.nombre_estado}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ManageServicios;
