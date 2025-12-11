import React, { useState, useEffect } from "react";
import { X } from "react-feather";

const EventDetails = ({ isOpen, onClose, eventData, token, onInscripcion }) => {
  const [inscriptionMessage, setInscriptionMessage] = useState("");
  const [isInscrito, setIsInscrito] = useState(false);

  if (!isOpen) return null;

  // Verificar inscripción
  useEffect(() => {
    const checkInscripcion = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/eventos/${eventData.evento_id}/inscripcion`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al verificar inscripción.");
        }
        const data = await response.json();
        setIsInscrito(data.inscrito);
      } catch (error) {
        console.error("Error al verificar inscripción:", error);
      }
    };

    checkInscripcion();
  }, [eventData, token]);

  // Manejar inscripción
  const handleInscription = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/eventos/inscripcion`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ evento_id: eventData.evento_id }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setInscriptionMessage("¡Te has inscrito exitosamente!");
      setIsInscrito(true);
      onInscripcion();
    } catch (error) {
      setInscriptionMessage(`Error al inscribirse: ${error.message}`);
    }
  };

  // Manejar cancelación de inscripción
  const handleCancelInscription = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/eventos/inscripcion/${eventData.evento_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setInscriptionMessage("Has cancelado tu inscripción exitosamente.");
      setIsInscrito(false);
      onInscripcion();
    } catch (error) {
      setInscriptionMessage(`Error al cancelar inscripción: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 max-w-4xl relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <X size={24} />
        </button>

        {/* Título */}
        <h2 className="text-3xl font-bold mb-4">{eventData.nombre}</h2>

        {/* Fechas */}
        <p className="text-gray-600 text-sm">
          Fecha de inicio: {new Date(eventData.fecha_inicio).toLocaleString()}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          Fecha de fin: {new Date(eventData.fecha_fin).toLocaleString()}
        </p>

        {/* Cupos disponibles */}
        <p className="text-gray-600 text-sm mb-4">
          Cupos disponibles: {eventData.capacidad - eventData.inscritos}
        </p>

        {/* Descripción */}
        <p className="text-gray-700 mb-4">{eventData.descripcion}</p>

        {/* Inscritos */}
        <p className="text-gray-600 text-sm mb-6">
          Inscritos: {eventData.inscritos}
        </p>

        {/* Botón de inscripción o cancelación */}
        <div className="flex justify-between mt-4">
          {isInscrito ? (
            <button
              onClick={handleCancelInscription}
              className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            >
              Cancelar Inscripción
            </button>
          ) : (
            <button
              onClick={handleInscription}
              disabled={eventData.inscritos >= eventData.capacidad}
              className={`py-2 px-4 text-sm rounded-lg shadow-md ${
                eventData.inscritos >= eventData.capacidad
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {eventData.inscritos >= eventData.capacidad
                ? "Cupos llenos"
                : "Inscribirse"}
            </button>
          )}
        </div>

        {/* Mensaje de inscripción */}
        {inscriptionMessage && (
          <p className="text-center text-sm text-green-600 mt-4">
            {inscriptionMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
