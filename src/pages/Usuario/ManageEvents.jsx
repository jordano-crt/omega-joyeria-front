import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../services/authContext";
import EventDetails from "./EventsDetail";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { token } = useContext(AuthContext);

  // Obtener todos los eventos
  const fetchEvents = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/eventos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar los eventos");
      }

      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openDetailsModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleInscripcion = () => {
    fetchEvents(); // Actualiza la lista de eventos tras una inscripción
  };

  return (
    <section className="mt-20 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        {/* Título */}
        <h1 className="text-5xl font-semibold text-gray-800 text-center mb-10">
          Eventos y Talleres
        </h1>
        {/* Texto adicional */}
        <p className="text-lg text-gray-700 text-left mb-8">
          En nuestra tienda, ofrecemos una variedad de eventos diseñados para
          que nuestros clientes disfruten y aprendan más sobre el fascinante
          mundo de la relojería y la joyería. Explora los próximos eventos y
          talleres que tenemos disponibles, cada uno dirigido por expertos en el
          sector.
        </p>

        {/* Contenido principal */}
        {loading ? (
          <p className="text-center text-gray-600">Cargando eventos...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500">
            No se encontraron eventos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event) => (
              <motion.div
                key={event.evento_id}
                className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Título del evento */}
                <h3 className="text-lg font-medium text-gray-700">
                  {event.nombre}
                </h3>
                {/* Fechas del evento */}
                <p className="text-gray-500 text-xs mt-1">
                  Fecha: {new Date(event.fecha_inicio).toLocaleDateString()} -{" "}
                  {new Date(event.fecha_fin).toLocaleDateString()}
                </p>
                {/* Descripción del evento */}
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {event.descripcion}
                </p>
                {/* Botón Ver Más */}
                <div className="mt-4">
                  <button
                    onClick={() => openDetailsModal(event)}
                    className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out w-full"
                  >
                    Ver Más
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal para ver detalles del evento */}
        {isModalOpen && selectedEvent && (
          <EventDetails
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            eventData={selectedEvent}
            token={token}
            onInscripcion={handleInscripcion}
          />
        )}
      </div>
    </section>
  );
};

export default ManageEvents;
