import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../services/authContext";
import { 
  obtenerCitas, 
  eliminarCita, 
  crearCita, 
  actualizarCita,
  obtenerTodasLasCitasAdmin,
  crearCitaAdmin,
  actualizarCitaAdmin,
  eliminarCitaAdmin
} from "../../services/citasServiceNew";
import { obtenerDisponibilidadesPublicas, obtenerDisponibilidadesPublicasConCita, obtenerDisponibilidadesAdmin, formatearFecha, formatearHora, agruparPorFecha } from "../../services/disponibilidadService";
import { obtenerServicios } from "../../services/citasServiceNew";
import { obtenerTodosLosUsuarios } from "../../services/usuariosService";
import Modal from "../../components/Modal";

const ManageCitasNew = () => {
  console.log("🚀 COMPONENTE - ManageCitasNew iniciado");
  
  const [citas, setCitas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [deletingCitaId, setDeletingCitaId] = useState(null);
  const [editingCita, setEditingCita] = useState(null);
  
  // Form state para crear cita
  const [formData, setFormData] = useState({
    usuario_id: "", // Para administradores
    disponibilidad_id: "",
    servicio_id: "",
    notas: ""
  });

  const { token, user, isLoading: authLoading } = useContext(AuthContext);
  
  // Verificar si el usuario es administrador
  const isAdmin = user?.rol_id === 2;

  // Función para obtener las citas
  const fetchCitas = async () => {
    try {
      const response = isAdmin ? await obtenerTodasLasCitasAdmin() : await obtenerCitas();
      console.log("🔍 DEBUG - Respuesta de citas del backend:", response);
      console.log("🔍 DEBUG - Datos de citas:", response.data);
      setCitas(response.data || []);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      setError(`Error al cargar citas: ${error.message}`);
    }
  };

  // Función para obtener usuarios (solo admin)
  const fetchUsuarios = async () => {
    if (!isAdmin) return;
    try {
      const response = await obtenerTodosLosUsuarios();
      setUsuarios(response.data || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      // No establecer error aquí para evitar bloquear la carga
    }
  };

  // Función para obtener disponibilidades
  const fetchDisponibilidades = async (incluirOcupadas = false, citaEditando = null) => {
    try {
      if (isAdmin || incluirOcupadas) {
        // Admin o cuando editamos, necesitamos todas las disponibilidades
        const response = await obtenerDisponibilidadesAdmin();
        let todasDisponibilidades = response.data || [];
        
        // Si estamos editando una cita, asegurar que su disponibilidad actual esté incluida
        if (citaEditando && citaEditando.disponibilidad_id) {
          const disponibilidadActual = todasDisponibilidades.find(d => 
            d.disponibilidad_id == citaEditando.disponibilidad_id
          );
          
          // Si no encontramos la disponibilidad actual, la agregamos manualmente
          if (!disponibilidadActual) {
            todasDisponibilidades.push({
              disponibilidad_id: citaEditando.disponibilidad_id,
              fecha: citaEditando.fecha,
              hora_inicio: citaEditando.hora_inicio,
              hora_fin: citaEditando.hora_fin,
              estado: 'ocupada'
            });
          }
        }
        
        setDisponibilidades(todasDisponibilidades);
      } else {
        // Usuario normal - usar función especializada para incluir slot actual si está editando
        const response = citaEditando 
          ? await obtenerDisponibilidadesPublicasConCita(citaEditando.cita_id)
          : await obtenerDisponibilidadesPublicas();
        setDisponibilidades(response.data || []);
      }
    } catch (error) {
      console.error("Error al obtener disponibilidades:", error);
      // Fallback a disponibilidades públicas
      try {
        const response = citaEditando 
          ? await obtenerDisponibilidadesPublicasConCita(citaEditando.cita_id)
          : await obtenerDisponibilidadesPublicas();
        setDisponibilidades(response.data || []);
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError);
      }
    }
  };

  // Función para obtener servicios
  const fetchServicios = async () => {
    try {
      const response = await obtenerServicios();
      // El endpoint de servicios devuelve directamente un array
      setServicios(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      
      setLoading(true);
      setError("");
      
      try {
        // Cargar datos de forma secuencial para identificar errores
        console.log("Cargando disponibilidades...");
        await fetchDisponibilidades();
        
        console.log("Cargando servicios...");
        await fetchServicios();
        
        if (token && user) {
          console.log("Cargando citas...");
          await fetchCitas();
        }
        
        if (isAdmin) {
          console.log("Cargando usuarios (admin)...");
          await fetchUsuarios();
        }
        
        console.log("Datos cargados exitosamente");
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError(`Error al cargar datos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, user, authLoading, isAdmin]);

  // Verificar si la cita es cancelable (24 horas antes)
  const esCancelable = (fechaHora) => {
    try {
      // Validar que fechaHora no sea null, undefined o string vacío
      if (!fechaHora || typeof fechaHora !== 'string') {
        console.log(`DEBUG - esCancelable: fechaHora inválido (${fechaHora})`);
        return false;
      }

      const ahora = new Date();
      const fechaCita = new Date(fechaHora);
      
      // Verificar que la fecha sea válida
      if (isNaN(fechaCita.getTime())) {
        console.log(`DEBUG - esCancelable: fecha inválida (${fechaHora})`);
        return false;
      }
      
      const diferenciaHoras = (fechaCita - ahora) / (1000 * 60 * 60);
      console.log(`DEBUG - esCancelable: fechaCita=${fechaCita.toISOString()}, ahora=${ahora.toISOString()}, diferencia=${diferenciaHoras}h`);
      return diferenciaHoras >= 24;
    } catch (error) {
      console.error(`DEBUG - esCancelable: Error procesando fecha (${fechaHora}):`, error);
      return false;
    }
  };

  // Manejar creación de cita
  const handleCreateCita = async (e) => {
    e.preventDefault();
    try {
      if (!formData.disponibilidad_id || !formData.servicio_id) {
        setError("Selecciona una disponibilidad y un servicio");
        return;
      }

      if (isAdmin && !formData.usuario_id) {
        setError("Selecciona un usuario para la cita");
        return;
      }

      if (editingCita) {
        // Actualizar cita existente
        if (isAdmin) {
          await actualizarCitaAdmin(editingCita.cita_id, formData);
        } else {
          await actualizarCita(editingCita.cita_id, formData);
        }
        setEditingCita(null);
      } else {
        // Crear nueva cita
        if (isAdmin) {
          await crearCitaAdmin(formData);
        } else {
          await crearCita(formData);
        }
      }

      setShowCreateForm(false);
      const resetFormData = isAdmin 
        ? { usuario_id: "", disponibilidad_id: "", servicio_id: "", notas: "" }
        : { disponibilidad_id: "", servicio_id: "", notas: "" };
      setFormData(resetFormData);
      await fetchCitas();
      await fetchDisponibilidades(isAdmin);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  // Manejar edición de cita
  const handleEditCita = async (cita) => {
    // Para usuarios normales, verificar las 24 horas
    if (!isAdmin) {
      const fechaHora = `${cita.fecha}T${cita.hora_inicio}`;
      if (!esCancelable(fechaHora)) {
        setError("Solo puedes modificar citas con más de 24 horas de anticipación");
        return;
      }
    }

    setEditingCita(cita);
    const editFormData = isAdmin 
      ? {
          usuario_id: cita.usuario_id || "",
          disponibilidad_id: cita.disponibilidad_id || "",
          servicio_id: cita.servicio_id || "",
          notas: cita.notas || ""
        }
      : {
          disponibilidad_id: cita.disponibilidad_id || "",
          servicio_id: cita.servicio_id || "",
          notas: cita.notas || ""
        };
    
    setFormData(editFormData);
    
    // Cargar todas las disponibilidades incluyendo la actual
    await fetchDisponibilidades(true, cita);
    
    setShowCreateForm(true);
    setError("");
  };

  // Manejar eliminación de cita
  const handleDelete = async () => {
    console.log("🔧 DEBUG - handleDelete iniciado");
    console.log("🔧 DEBUG - deletingCitaId:", deletingCitaId);
    console.log("🔧 DEBUG - isAdmin:", isAdmin);
    console.log("🔧 DEBUG - selectedCita:", selectedCita);
    
    try {
      if (isAdmin) {
        console.log("🔧 DEBUG - Eliminando como admin");
        await eliminarCitaAdmin(deletingCitaId);
      } else {
        console.log("🔧 DEBUG - Eliminando como usuario");
        await eliminarCita(deletingCitaId);
      }
      
      console.log("🔧 DEBUG - Eliminación exitosa, actualizando datos");
      await fetchCitas();
      await fetchDisponibilidades(isAdmin);
      setIsDeleteModalOpen(false);
      setSelectedCita(null);
      setDeletingCitaId(null);
      console.log("🔧 DEBUG - handleDelete completado exitosamente");
    } catch (error) {
      console.error("🔧 DEBUG - Error en handleDelete:", error);
      setError(error.message);
    }
  };

  // Resetear formulario
  const resetForm = async () => {
    const resetFormData = isAdmin 
      ? { usuario_id: "", disponibilidad_id: "", servicio_id: "", notas: "" }
      : { disponibilidad_id: "", servicio_id: "", notas: "" };
    setFormData(resetFormData);
    setShowCreateForm(false);
    setEditingCita(null);
    setError("");
    
    // Volver a cargar las disponibilidades apropiadas
    await fetchDisponibilidades(isAdmin);
  };

  // Agrupar disponibilidades por fecha
  const disponibilidadesAgrupadas = agruparPorFecha(disponibilidades);

  // Obtener color del estado de la cita
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Debes iniciar sesión para ver tus citas.</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 font-ibm min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          {isAdmin ? "Gestión de Citas (Administrador)" : "Mis Citas"}
        </h1>

        {/* Botón para crear nueva cita */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              if (showCreateForm) {
                resetForm();
              } else {
                setShowCreateForm(true);
                setEditingCita(null); // Limpiar edición si se va a crear nueva
              }
            }}
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

        {/* Formulario para crear cita */}
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
              
              <form onSubmit={handleCreateCita} className="space-y-4">
                {/* Selección de usuario (solo para administradores) */}
                {isAdmin && (
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
                )}

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
                        {servicio.nombre_servicio} - ${servicio.precio} - {servicio.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de disponibilidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora Disponible *
                  </label>
                  {editingCita && (
                    <p className="text-sm text-blue-600 mb-2">
                      💡 Tu horario actual: {formatearFecha(editingCita.fecha)} de {formatearHora(editingCita.hora_inicio)} a {formatearHora(editingCita.hora_fin)}. 
                      Puedes mantenerlo o elegir uno nuevo.
                    </p>
                  )}
                  <select
                    value={formData.disponibilidad_id}
                    onChange={(e) => setFormData({...formData, disponibilidad_id: e.target.value})}
                    required
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona fecha y hora</option>
                    {editingCita && (
                      <option 
                        value={editingCita.disponibilidad_id}
                        className="bg-blue-50 text-blue-800 font-semibold"
                      >
                        🕒 Mantener horario actual: {formatearFecha(editingCita.fecha)} de {formatearHora(editingCita.hora_inicio)} a {formatearHora(editingCita.hora_fin)}
                      </option>
                    )}
                    {Object.keys(disponibilidadesAgrupadas)
                      .sort()
                      .map((fecha) => (
                        <optgroup key={fecha} label={`📅 ${formatearFecha(fecha)}`}>
                          {disponibilidadesAgrupadas[fecha]
                            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                            .filter((disponibilidad) => {
                              // Filtrar la disponibilidad actual ya que está arriba como opción especial
                              if (editingCita && disponibilidad.disponibilidad_id == editingCita.disponibilidad_id) {
                                return false;
                              }
                              // Mostrar solo disponibles para nuevos horarios
                              return disponibilidad.estado === 'disponible';
                            })
                            .map((disponibilidad) => (
                              <option 
                                key={disponibilidad.disponibilidad_id} 
                                value={disponibilidad.disponibilidad_id}
                              >
                                {formatearHora(disponibilidad.hora_inicio)} - {formatearHora(disponibilidad.hora_fin)}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                  </select>
                  {disponibilidades.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No hay disponibilidades en este momento. El administrador debe crear horarios disponibles.
                    </p>
                  )}
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
                    placeholder="Información adicional sobre tu cita..."
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
                    disabled={!formData.disponibilidad_id || !formData.servicio_id || (isAdmin && !formData.usuario_id)}
                    className="py-2 px-4 text-sm border-2 rounded-lg bg-sgreen text-white border-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingCita ? "Actualizar Cita" : "Crear Cita"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de citas existentes */}
        {loading ? (
          <p className="text-center text-gray-600">Cargando citas...</p>
        ) : citas.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>{isAdmin ? "No hay citas en el sistema." : "No tienes citas programadas."}</p>
            <p className="mt-2 text-sm">{isAdmin ? "Crea la primera cita para un usuario." : "¡Programa tu primera cita!"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {citas
              .map((cita) => {
              console.log("🔍 RENDER - Renderizando cita:", cita);
              
              // Validar que los datos de la cita estén completos
              if (!cita.fecha || !cita.hora_inicio) {
                console.error("🔍 RENDER - Cita con datos incompletos:", cita);
                return null; // No renderizar esta cita
              }
              
              const fechaHoraCita = `${cita.fecha}T${cita.hora_inicio}`;
              const esCancelableCita = esCancelable(fechaHoraCita);
              console.log(`🔍 RENDER - Cita ${cita.cita_id}: fechaHora=${fechaHoraCita}, cancelable=${esCancelableCita}`);
              
              return (
              <motion.div
                key={cita.cita_id}
                className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {cita.servicio_nombre}
                    </h3>
                    {isAdmin && (
                      <p className="text-sm text-blue-600 font-medium">
                        {cita.usuario_nombre} {cita.usuario_apellido} ({cita.usuario_email})
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(cita.estado_nombre)}`}>
                    {cita.estado_nombre || 'Pendiente'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
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
                    onClick={() => handleEditCita(cita)}
                    disabled={!isAdmin && (!cita.fecha || !cita.hora_inicio || !esCancelable(`${cita.fecha}T${cita.hora_inicio}`))}
                    className={`py-2 px-4 text-sm rounded-lg transition duration-300 ${
                      isAdmin || (cita.fecha && cita.hora_inicio && esCancelable(`${cita.fecha}T${cita.hora_inicio}`))
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      isAdmin 
                        ? 'Editar cita (Admin)' 
                        : (cita.fecha && cita.hora_inicio && esCancelable(`${cita.fecha}T${cita.hora_inicio}`))
                          ? 'Editar cita' 
                          : 'No se puede editar (menos de 24h)'
                    }
                  >
                    {isAdmin || (cita.fecha && cita.hora_inicio && esCancelable(`${cita.fecha}T${cita.hora_inicio}`)) ? 'Editar' : 'No editable'}
                  </button>
                  <button
                    onClick={() => {
                      console.log("🚨 CLICK DETECTADO - Inicio del onClick");
                      console.log("🚨 EVENTO - El botón fue clickeado");
                      
                      // Validar datos de la cita antes de proceder
                      if (!cita.fecha || !cita.hora_inicio) {
                        console.error("🚨 ERROR - Datos de cita incompletos:", cita);
                        return;
                      }
                      
                      const fechaHora = `${cita.fecha}T${cita.hora_inicio}`;
                      console.log(`🔧 DEBUG - Botón cancelar clickeado: citaId=${cita.cita_id}, isAdmin=${isAdmin}, fechaHora=${fechaHora}`);
                      console.log(`🔧 DEBUG - esCancelable result:`, esCancelable(fechaHora));
                      console.log(`🔧 DEBUG - Botón habilitado:`, isAdmin || esCancelable(fechaHora));
                      console.log(`🔧 DEBUG - Cita completa:`, cita);
                      
                      setDeletingCitaId(cita.cita_id);
                      
                      // Crear objeto selectedCita con fecha_hora construida correctamente
                      const citaConFechaHora = {
                        ...cita,
                        fecha_hora: fechaHora
                      };
                      
                      console.log(`🔧 DEBUG - citaConFechaHora:`, citaConFechaHora);
                      setSelectedCita(citaConFechaHora);
                      setIsDeleteModalOpen(true);
                      
                      console.log(`🔧 DEBUG - Modal abierto, deletingCitaId=${cita.cita_id}`);
                      console.log("🚨 CLICK DETECTADO - Fin del onClick");
                    }}
                    disabled={!isAdmin && (!cita.fecha || !cita.hora_inicio || !esCancelable(`${cita.fecha}T${cita.hora_inicio}`))}
                    className={`py-2 px-4 text-sm rounded-lg transition duration-300 ${
                      isAdmin || (cita.fecha && cita.hora_inicio && esCancelable(`${cita.fecha}T${cita.hora_inicio}`))
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      isAdmin 
                        ? 'Eliminar cita (Admin)' 
                        : (cita.fecha && cita.hora_inicio && esCancelable(`${cita.fecha}T${cita.hora_inicio}`))
                          ? 'Cancelar cita' 
                          : 'No se puede cancelar (menos de 24h)'
                    }
                  >
                    {isAdmin || (cita.fecha && cita.hora_inicio && esCancelable(`${cita.fecha}T${cita.hora_inicio}`)) ? (isAdmin ? 'Eliminar' : 'Cancelar') : 'No cancelable'}
                  </button>
                </div>
              </motion.div>
            );
            })
            .filter(Boolean) // Filtrar los elementos null
            }
          </div>
        )}
      </div>

      {/* Modal para confirmar eliminación */}
      <Modal
        showModal={isDeleteModalOpen}
        toggleModal={() => {
          console.log("🔧 DEBUG MODAL - Cerrando modal");
          setIsDeleteModalOpen(false);
        }}
        onConfirm={() => {
          const esCancelableModal = isAdmin || esCancelable(selectedCita?.fecha_hora);
          console.log("🔧 DEBUG MODAL - onConfirm ejecutado");
          console.log("🔧 DEBUG MODAL - selectedCita:", selectedCita);
          console.log("🔧 DEBUG MODAL - selectedCita.fecha_hora:", selectedCita?.fecha_hora);
          console.log("🔧 DEBUG MODAL - isAdmin:", isAdmin);
          console.log("🔧 DEBUG MODAL - esCancelable result:", esCancelable(selectedCita?.fecha_hora));
          console.log("🔧 DEBUG MODAL - esCancelableModal:", esCancelableModal);
          
          if (esCancelableModal) {
            console.log("🔧 DEBUG MODAL - Ejecutando handleDelete");
            handleDelete();
          } else {
            console.log("🔧 DEBUG MODAL - Solo cerrando modal (no cancelable)");
            setIsDeleteModalOpen(false);
          }
        }}
        loading={false}
        title="Cancelar Cita"
        message={
          (isAdmin || esCancelable(selectedCita?.fecha_hora))
            ? "¿Estás seguro de que deseas cancelar esta cita? Esta acción liberará el horario para otros usuarios."
            : "No puedes cancelar esta cita porque faltan menos de 24 horas. Si necesitas ayuda, contáctanos."
        }
        confirmText={
          (isAdmin || esCancelable(selectedCita?.fecha_hora)) ? "Cancelar Cita" : "Cerrar"
        }
        cancelText="Mantener Cita"
      />
    </section>
  );
};

export default ManageCitasNew;
