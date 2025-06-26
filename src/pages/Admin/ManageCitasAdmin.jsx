import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../services/authContext";
import { 
  obtenerTodasLasCitasAdmin,
  crearCitaAdmin,
  actualizarCitaAdmin,
  eliminarCitaAdmin
} from "../../services/citasServiceNew";
import { obtenerDisponibilidadesAdmin, formatearFecha, formatearHora } from "../../services/disponibilidadService";
import { obtenerServicios } from "../../services/citasServiceNew";
import { obtenerTodosLosUsuarios } from "../../services/usuariosService";

const ManageCitasAdmin = () => {
  const [citas, setCitas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCita, setEditingCita] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    usuario_id: "",
    disponibilidad_id: "",
    servicio_id: "",
    notas: ""
  });

  const { token, user } = useContext(AuthContext);

  // Cargar datos iniciales
  const fetchData = async () => {
    try {
      setLoading(true);
      const [citasResponse, usuariosResponse, disponibilidadesResponse, serviciosResponse] = await Promise.all([
        obtenerTodasLasCitasAdmin(),
        obtenerTodosLosUsuarios(),
        obtenerDisponibilidadesAdmin(),
        obtenerServicios()
      ]);

      setCitas(citasResponse.data || []);
      setUsuarios(usuariosResponse.data || []);
      setDisponibilidades(disponibilidadesResponse.data || []);
      setServicios(Array.isArray(serviciosResponse) ? serviciosResponse : serviciosResponse.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchData();
    }
  }, [token, user]);

  // Manejar creación/edición de cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.usuario_id || !formData.disponibilidad_id || !formData.servicio_id) {
        setError("Todos los campos son requeridos");
        return;
      }

      if (editingCita) {
        await actualizarCitaAdmin(editingCita.cita_id, formData);
      } else {
        await crearCitaAdmin(formData);
      }

      setShowCreateForm(false);
      setEditingCita(null);
      setFormData({ usuario_id: "", disponibilidad_id: "", servicio_id: "", notas: "" });
      await fetchData();
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para obtener disponibilidades incluyendo la actual cuando se edita
  const fetchDisponibilidadesParaEdicion = async (citaActual = null) => {
    try {
      // Obtener todas las disponibilidades disponibles
      const disponibilidadesResponse = await obtenerDisponibilidadesAdmin();
      let todasLasDisponibilidades = disponibilidadesResponse.data || [];
      
      // Si estamos editando una cita, necesitamos incluir su disponibilidad actual
      if (citaActual && citaActual.disponibilidad_id) {
        // Verificar si la disponibilidad actual ya está en la lista
        const disponibilidadActualExiste = todasLasDisponibilidades.some(
          d => d.disponibilidad_id === citaActual.disponibilidad_id
        );
        
        // Si no existe (porque está ocupada), la agregamos manualmente
        if (!disponibilidadActualExiste) {
          const disponibilidadActual = {
            disponibilidad_id: citaActual.disponibilidad_id,
            fecha: citaActual.fecha,
            hora_inicio: citaActual.hora_inicio,
            hora_fin: citaActual.hora_fin,
            estado: 'ocupada',
            es_actual: true // Marcador para identificarla
          };
          todasLasDisponibilidades.push(disponibilidadActual);
        } else {
          // Si existe, marcarla como actual
          todasLasDisponibilidades = todasLasDisponibilidades.map(d => 
            d.disponibilidad_id === citaActual.disponibilidad_id 
              ? { ...d, es_actual: true }
              : d
          );
        }
      }
      
      setDisponibilidades(todasLasDisponibilidades);
      console.log('Disponibilidades cargadas para edición:', todasLasDisponibilidades.length);
    } catch (error) {
      console.error("Error al cargar disponibilidades para edición:", error);
      setError(error.message);
    }
  };

  // Manejar edición
  const handleEdit = async (cita) => {
    console.log('Editando cita:', cita);
    
    setFormData({
      usuario_id: cita.usuario_id || "",
      disponibilidad_id: cita.disponibilidad_id || "",
      servicio_id: cita.servicio_id || "",
      notas: cita.notas || ""
    });
    
    setEditingCita(cita);
    
    // Cargar disponibilidades incluyendo la actual
    await fetchDisponibilidadesParaEdicion(cita);
    
    setShowCreateForm(true);
  };

  // Manejar eliminación
  const handleDelete = async (citaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      try {
        await eliminarCitaAdmin(citaId);
        await fetchData();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Resetear formulario
  const resetForm = async () => {
    setFormData({ usuario_id: "", disponibilidad_id: "", servicio_id: "", notas: "" });
    setShowCreateForm(false);
    setEditingCita(null);
    setError("");
    
    // Volver a cargar solo las disponibilidades disponibles
    try {
      const disponibilidadesResponse = await obtenerDisponibilidadesAdmin();
      setDisponibilidades(disponibilidadesResponse.data || []);
    } catch (error) {
      console.error("Error al recargar disponibilidades:", error);
    }
  };

  // Obtener disponibilidades disponibles
  const getDisponibilidadesDisponibles = () => {
    return disponibilidades.filter(d => 
      d.estado === 'disponible' || 
      (editingCita && d.disponibilidad_id == editingCita.disponibilidad_id)
    );
  };

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Gestión de Citas (Administrador)
        </h1>

        {/* Botón para crear nueva cita */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
          >
            {showCreateForm ? "Cancelar" : "Nueva Cita"}
          </button>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Formulario para crear/editar cita */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm mb-6"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingCita ? "Editar Cita" : "Nueva Cita"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selección de usuario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario *
                  </label>
                  <select
                    value={formData.usuario_id}
                    onChange={(e) => setFormData({...formData, usuario_id: e.target.value})}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.usuario_id} value={usuario.usuario_id}>
                        {usuario.nombre} {usuario.apellido_paterno} - {usuario.correo_electronico}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio *
                  </label>
                  <select
                    value={formData.servicio_id}
                    onChange={(e) => setFormData({...formData, servicio_id: e.target.value})}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios.map((servicio) => (
                      <option key={servicio.servicio_id} value={servicio.servicio_id}>
                        {servicio.nombre_servicio} - ${servicio.precio}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de disponibilidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario disponible *
                  </label>
                  <select
                    value={formData.disponibilidad_id}
                    onChange={(e) => setFormData({ ...formData, disponibilidad_id: e.target.value })}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar horario</option>
                    {disponibilidades
                      .filter(d => d.estado === 'disponible' || d.es_actual)
                      .sort((a, b) => {
                        // Ordenar por fecha y luego por hora
                        if (a.fecha !== b.fecha) {
                          return new Date(a.fecha) - new Date(b.fecha);
                        }
                        return a.hora_inicio.localeCompare(b.hora_inicio);
                      })
                      .map((disponibilidad) => (
                        <option 
                          key={disponibilidad.disponibilidad_id} 
                          value={disponibilidad.disponibilidad_id}
                        >
                          {formatearFecha(disponibilidad.fecha)} - {formatearHora(disponibilidad.hora_inicio)} a {formatearHora(disponibilidad.hora_fin)}
                          {disponibilidad.es_actual ? ' (Horario Actual)' : ''}
                          {disponibilidad.estado === 'ocupada' && !disponibilidad.es_actual ? ' (Ocupado)' : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    rows={3}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Información adicional sobre la cita..."
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4">
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
                    {editingCita ? "Actualizar Cita" : "Crear Cita"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de todas las citas */}
        {citas.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No hay citas registradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {citas.map((cita) => (
              <motion.div
                key={cita.cita_id}
                className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-800">
                    {cita.servicio_nombre}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(cita.estado_nombre)}`}>
                    {cita.estado_nombre}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Cliente:</span> {cita.usuario_nombre} {cita.usuario_apellido}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Email:</span> {cita.usuario_email}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Fecha:</span> {formatearFecha(cita.fecha)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Hora:</span> {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Precio:</span> ${cita.servicio_precio}
                  </p>
                  {cita.notas && (
                    <p className="text-gray-500 text-xs">
                      <span className="font-medium">Notas:</span> {cita.notas}
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between space-x-2">
                  <button
                    onClick={() => handleEdit(cita)}
                    className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cita.cita_id)}
                    className="bg-red-500 text-white py-2 px-4 text-sm rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageCitasAdmin;
