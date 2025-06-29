import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../services/authContext';
import {
  obtenerTodasLasReseñas,
  obtenerReseñasPendientes,
  aceptarReseña,
  rechazarReseña,
  eliminarReseñaAdmin
} from '../../services/testimoniosServiceAdmin';

const AdminManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes' o 'todas'
  const { token } = useContext(AuthContext);

  // Función para obtener reseñas según la pestaña activa
  const fetchTestimonials = async () => {
    setError('');
    setLoading(true);
    try {
      let data;
      if (activeTab === 'pendientes') {
        data = await obtenerReseñasPendientes(token);
      } else {
        data = await obtenerTodasLasReseñas(token);
      }
      setTestimonials(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [activeTab]);

  // Función para confirmar una reseña
  const handleConfirm = async (id) => {
    try {
      await aceptarReseña(id, token);
      // Actualiza la lista eliminando la reseña confirmada
      setTestimonials((prev) => prev.filter((testimonial) => testimonial.testimonio_id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para rechazar una reseña
  const handleReject = async (id) => {
    try {
      await rechazarReseña(id, token);
      // Actualiza la lista eliminando la reseña rechazada
      setTestimonials((prev) => prev.filter((testimonial) => testimonial.testimonio_id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para eliminar una reseña como administrador
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar permanentemente esta reseña?')) {
      try {
        await eliminarReseñaAdmin(id, token);
        // Actualiza la lista eliminando la reseña eliminada
        setTestimonials((prev) => prev.filter((testimonial) => testimonial.testimonio_id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Variantes de animación para las tarjetas
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Gestionar Reseñas
        </h1>

        {/* Pestañas */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pendientes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setActiveTab('todas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'todas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todas las Reseñas
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando testimonios...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-500">
            {activeTab === 'pendientes' ? 'No hay testimonios pendientes.' : 'No hay testimonios.'}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                exit: { opacity: 0 },
              }}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.testimonio_id}
                  className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
                  variants={cardVariants}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-700">
                      {`${testimonial.nombre || "Anónimo"} ${testimonial.apellido_paterno || ""} ${testimonial.apellido_materno || ""}`}
                    </h3>
                    {activeTab === 'todas' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(testimonial.nombre_estado || 'Pendiente')}`}>
                        {testimonial.nombre_estado || 'Pendiente'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-xs">
                    {"★".repeat(testimonial.estrellas || 0)}{"☆".repeat(5 - (testimonial.estrellas || 0))}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3 mt-2">
                    {testimonial.contenido || "Sin contenido disponible"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Fecha:{" "}
                    {testimonial.fecha_creacion
                      ? new Date(testimonial.fecha_creacion).toLocaleDateString()
                      : "Sin fecha"}
                  </p>

                  {/* Botones de acción */}
                  <div className="flex justify-between items-center mt-4 space-x-2">
                    {activeTab === 'pendientes' ? (
                      <>
                        <button
                          onClick={() => handleConfirm(testimonial.testimonio_id)}
                          className="bg-green-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleReject(testimonial.testimonio_id)}
                          className="bg-red-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDelete(testimonial.testimonio_id)}
                        className="bg-red-600 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-red-700 transition duration-300 w-full"
                      >
                        Eliminar Permanentemente
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default AdminManageTestimonials;
