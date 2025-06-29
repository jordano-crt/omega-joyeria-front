import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../services/authContext";
import { getTodayDateString } from "../../utils/dateUtils";
import {
  obtenerDisponibilidadesAdmin,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad,
  formatearFecha,
  formatearHora,
  agruparPorFecha
} from "../../services/disponibilidadService";
import { eliminarCitaAdmin } from "../../services/citasServiceNew";

const ManageDisponibilidad = () => {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDisponibilidad, setEditingDisponibilidad] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  const [formData, setFormData] = useState({
    fecha: "",
    horaInicio: "",
    horaFin: "",
    estado: "disponible"
  });

  const { user } = useContext(AuthContext);

  const fetchDisponibilidades = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;

      const response = await obtenerDisponibilidadesAdmin(params);
      setDisponibilidades(response.data || []);
    } catch (error) {
      console.error('Error en fetchDisponibilidades:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisponibilidades();
  }, [filtroEstado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDisponibilidad) {
        await actualizarDisponibilidad(editingDisponibilidad.disponibilidad_id, formData);
      } else {
        await crearDisponibilidad(formData);
      }
      resetForm();
      fetchDisponibilidades();
    } catch (error) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: "",
      horaInicio: "",
      horaFin: "",
      estado: "disponible"
    });
    setEditingDisponibilidad(null);
    setShowForm(false);
  };

  const handleEdit = (disponibilidad) => {
    setFormData({
      fecha: disponibilidad.fecha,
      horaInicio: disponibilidad.hora_inicio,
      horaFin: disponibilidad.hora_fin,
      estado: disponibilidad.estado // Mantener el estado actual sin permitir editarlo
    });
    setEditingDisponibilidad(disponibilidad);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta disponibilidad?")) {
      try {
        await eliminarDisponibilidad(id);
        fetchDisponibilidades();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleEliminarCita = async (citaId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita? Esto liberará el horario.")) {
      try {
        await eliminarCitaAdmin(citaId);
        setError("");
        fetchDisponibilidades();
      } catch (error) {
        setError(`Error al eliminar cita: ${error.message}`);
      }
    }
  };

  const getFechaMinima = () => getTodayDateString();

  const disponibilidadesAgrupadas = agruparPorFecha(disponibilidades);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'ocupada': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Gestión de Disponibilidades
        </h1>

        {/* Botón y filtro de estado */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
          >
            {showForm ? "Cancelar" : "Nueva Disponibilidad"}
          </button>

          <div className="flex space-x-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="py-1 px-3 text-sm border-2 rounded-lg bg-white text-gray-700 border-gray-200"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
            </select>
          </div>
        </div>

        {/* Formulario de nueva/edición disponibilidad */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm mb-6"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingDisponibilidad ? "Editar Disponibilidad" : "Nueva Disponibilidad"}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    min={getFechaMinima()}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4">
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
                    {editingDisponibilidad ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Cargando disponibilidades...</p>
        ) : Object.keys(disponibilidadesAgrupadas).length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No hay disponibilidades configuradas.</p>
            <p className="mt-2 text-sm">Crea la primera disponibilidad para empezar.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(disponibilidadesAgrupadas)
              .sort()
              .map((fecha) => (
                <div key={fecha} className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {formatearFecha(fecha)}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {disponibilidadesAgrupadas[fecha]
                      .filter((d) => d.estado !== "cancelada")
                      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                      .map((disponibilidad) => (
                        <motion.div
                          key={disponibilidad.disponibilidad_id}
                          className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-lg font-medium text-gray-800">
                              {formatearHora(disponibilidad.hora_inicio)} - {formatearHora(disponibilidad.hora_fin)}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(disponibilidad.estado)}`}>
                              {disponibilidad.estado}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            Creada por: {disponibilidad.admin_nombre} {disponibilidad.admin_apellido}
                          </p>

                          {disponibilidad.estado === 'ocupada' && disponibilidad.cita_id && (
                            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-3">
                              <h4 className="text-sm font-semibold text-orange-800 mb-2">Cita Reservada:</h4>
                              <p className="text-xs text-gray-700">
                                <span className="font-medium">Cliente:</span> {disponibilidad.cliente_nombre} {disponibilidad.cliente_apellido}
                              </p>
                              <p className="text-xs text-gray-700">
                                <span className="font-medium">Email:</span> {disponibilidad.cliente_email}
                              </p>
                              <p className="text-xs text-gray-700">
                                <span className="font-medium">Servicio:</span> {disponibilidad.servicio_nombre} (${disponibilidad.servicio_precio})
                              </p>
                              {disponibilidad.cita_notas && (
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Notas:</span> {disponibilidad.cita_notas}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between space-x-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(disponibilidad)}
                                className="bg-blue-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-blue-600 transition duration-300"
                              >
                                Editar
                              </button>

                              {disponibilidad.estado === 'ocupada' && disponibilidad.cita_id && (
                                <button
                                  onClick={() => handleEliminarCita(disponibilidad.cita_id)}
                                  className="bg-orange-500 text-white py-1 px-3 text-sm rounded-lg hover:bg-orange-600 transition duration-300"
                                >
                                  Liberar
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => handleDelete(disponibilidad.disponibilidad_id)}
                              disabled={disponibilidad.estado === 'ocupada'}
                              className={`py-1 px-3 text-sm rounded-lg transition duration-300 ${
                                disponibilidad.estado === 'ocupada'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              Eliminar
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageDisponibilidad;
