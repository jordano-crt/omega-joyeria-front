import { useState, useEffect, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../../services/authContext";
import { getFechasOcupadas, createCita } from "../../services/citasService";
import { formatDateForBackend, createDateFromParts } from "../../utils/dateUtils";

const FormCita = ({ isOpen, onClose, onSave }) => {
  const [fecha, setFecha] = useState(null); // Solo fecha sin hora
  const [hora, setHora] = useState(""); // Hora seleccionada
  const [servicioId, setServicioId] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]); // Horas disponibles para el día seleccionado
  const [servicios, setServicios] = useState([]);
  const { token } = useContext(AuthContext);

  const fetchServicios = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/servicios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los servicios.");
      }

      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error("Error en fetchServicios:", error.message);
    }
  };

  const fetchFechasOcupadas = async () => {
    try {
      const data = await getFechasOcupadas();
      setFechasOcupadas(data.map((item) => new Date(item.fecha_hora)));
    } catch (error) {
      console.error("Error en fetchFechasOcupadas:", error.message);
    }
  };

  // Filtrar las horas ocupadas para un día específico
  const calcularHorasDisponibles = (fechaSeleccionada) => {
    const horasOcupadas = fechasOcupadas
      .filter(
        (fechaOcupada) =>
          fechaOcupada.toDateString() === fechaSeleccionada.toDateString()
      )
      .map((fechaOcupada) => fechaOcupada.getHours());

    const todasLasHoras = Array.from({ length: 24 }, (_, i) => i); // Horas de 0 a 23
    const horasLibres = todasLasHoras.filter(
      (hora) => !horasOcupadas.includes(hora)
    );
    setHorasDisponibles(horasLibres);
  };

  useEffect(() => {
    if (isOpen) {
      fetchServicios();
      fetchFechasOcupadas();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (fecha) {
      calcularHorasDisponibles(fecha);
    }
  }, [fecha, fechasOcupadas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fecha || !hora || !servicioId) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const fechaHoraSeleccionada = createDateFromParts(fecha, hora);

    try {
      await createCita({
        fecha_hora: formatDateForBackend(fechaHoraSeleccionada),
        servicio_id: servicioId,
        notas,
      });

      onSave(); // Actualizar citas en el frontend
      onClose(); // Cerrar el modal
    } catch (error) {
      setError(error.message); // Mostrar el mensaje de error del backend
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Crear Nueva Cita
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Fecha
            </label>
            <DatePicker
              selected={fecha}
              onChange={(date) => setFecha(date)}
              dateFormat="P"
              className="w-full p-2 border rounded-lg"
              minDate={new Date()}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Hora</label>
            <select
              value={hora}
              onChange={(e) => setHora(Number(e.target.value))}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Selecciona una hora</option>
              {horasDisponibles.map((hora) => (
                <option key={hora} value={hora}>
                  {hora}:00
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Servicio
            </label>
            <select
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map(({ servicio_id, nombre_servicio }) => (
                <option key={servicio_id} value={servicio_id}>
                  {nombre_servicio}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows="3"
              placeholder="Escribe detalles adicionales aquí..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-sgreen py-2 px-4 border border-sgreen rounded-2xl transition duration-300 ease-in-out mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCita;
