import { useState, useEffect, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../../services/authContext";
import { getFechasOcupadas } from "../../services/citasService";
import { toast } from "react-toastify";
import { formatDateForBackend, createDateFromParts } from "../../utils/dateUtils";

const ModalCita = ({ isOpen, onClose, citaData, onSave }) => {
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [servicios, setServicios] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (isOpen && citaData) {
      const citaDate = new Date(citaData.fecha_hora);
      setFecha(citaDate);
      setHora(citaDate.getHours());
      setServicioId(citaData.servicio_id);
      setNotas(citaData.notas || "");
      fetchServicios();
      fetchFechasOcupadas();
    }
  }, [isOpen, citaData]);

  const fetchServicios = async () => {
    try {
      const response = await fetch("http://localhost:4000/servicios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener los servicios.");
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

  useEffect(() => {
    if (fecha) calcularHorasDisponibles(fecha);
  }, [fecha, fechasOcupadas]);

  const calcularHorasDisponibles = (fechaSeleccionada) => {
    const horasOcupadas = fechasOcupadas
      .filter(
        (fechaOcupada) =>
          fechaOcupada.toDateString() === fechaSeleccionada.toDateString()
      )
      .map((fechaOcupada) => fechaOcupada.getHours());
    const todasLasHoras = Array.from({ length: 24 }, (_, i) => i);
    setHorasDisponibles(
      todasLasHoras.filter((hora) => !horasOcupadas.includes(hora))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fecha || !hora || !servicioId) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const fechaHoraSeleccionada = createDateFromParts(fecha, hora);

    const citaDuplicada = fechasOcupadas.some(
      (fechaOcupada) =>
        fechaOcupada.getTime() === fechaHoraSeleccionada.getTime() &&
        fechaOcupada.getTime() !== new Date(citaData.fecha_hora).getTime()
    );

    if (citaDuplicada) {
      setError("La fecha y hora seleccionadas ya están ocupadas.");
      return;
    }

    try {
      const updatedCita = {
        fecha_hora: formatDateForBackend(fechaHoraSeleccionada),
        servicio_id: servicioId,
        notas,
      };

      await onSave(citaData.cita_id, updatedCita);

      toast.success("Cita actualizada con éxito.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      onClose();
    } catch (error) {
      setError("Error al actualizar la cita. Inténtalo de nuevo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        
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
              {servicios.map(({ servicio_id, nombre_servicio, precio, descripcion }) => (
                <option key={servicio_id} value={servicio_id}>
                  {nombre_servicio} - ${precio} - {descripcion}
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
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg mr-2 hover:bg-gray-400 transition duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCita;
