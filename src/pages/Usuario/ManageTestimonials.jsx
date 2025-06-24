import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../services/authContext";
import { obtenerTestimonios, eliminarTestimonio, actualizarTestimonio } from "../../services/testimoniosService";
import EditTestimonialModal from "./ModalTestimonials"; // Importar el modal

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStars, setFilterStars] = useState(null);
  const [filterOwn, setFilterOwn] = useState(false); // Filtro de reseñas propias
  const [currentPage, setCurrentPage] = useState(1); // Paginación
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla el estado del modal
  const [selectedTestimonial, setSelectedTestimonial] = useState(null); // Testimonio seleccionado para editar
  const { token, user, isLoading: authLoading } = useContext(AuthContext); // Obtenemos el token, usuario y estado de carga
  const navigate = useNavigate();
  const testimonialsPerPage = 5;

  // Función para obtener testimonios
  const fetchTestimonials = async (stars, isOwn, page = 1) => {
    setError("");
    setLoading(true);
    try {
      const params = {
        limit: testimonialsPerPage,
        page: page
      };
      
      if (stars) {
        params.stars = stars;
      }
      
      // Solo agregar filtro por usuario si está autenticado y quiere ver sus reseñas
      if (isOwn && user?.usuario_id) {
        params.usuario_id = user.usuario_id;
      }

      const data = await obtenerTestimonios(params);
      
      if (data && Array.isArray(data)) {
        setTestimonials(data);
        // Calculamos las páginas basándonos en si recibimos menos testimonios que el límite
        if (data.length < testimonialsPerPage) {
          setTotalPages(page);
        } else {
          setTotalPages(page + 1); // Al menos una página más
        }
      } else {
        setTestimonials([]);
        setTotalPages(1);
      }
    } catch (error) {
      setError(error.message);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Esperar a que el AuthContext termine de cargar
    if (authLoading) {
      return;
    }
    
    // Solo mostrar error si se está intentando filtrar por reseñas propias sin autenticación
    if (filterOwn && (!token || !user)) {
      setLoading(false);
      setError("Debes iniciar sesión para ver tus reseñas");
      setTestimonials([]);
      return;
    }
    
    // Solo mostrar error si se está intentando filtrar por reseñas propias siendo admin
    if (filterOwn && user?.rol_id === 2) {
      setLoading(false);
      setError("Los administradores no tienen reseñas propias");
      setTestimonials([]);
      return;
    }
    
    // Limpiar error cuando no se está filtrando por reseñas propias
    if (!filterOwn) {
      setError("");
    }
    
    // Cargar testimonios (públicos si no hay filtro propio, del usuario si hay filtro propio y está autenticado)
    fetchTestimonials(filterStars, filterOwn, currentPage);
  }, [filterStars, filterOwn, currentPage, token, user, authLoading]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Editar reseña
  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true); // Abrir el modal
  };

  // Eliminar reseña
  const handleDelete = async (id) => {
    try {
      await eliminarTestimonio(id);
      setTestimonials((prev) =>
        prev.filter((testimonial) => testimonial.testimonio_id !== id)
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // Guardar cambios en la reseña
  const handleSave = async (id, updatedTestimonial) => {
    try {
      const data = await actualizarTestimonio(id, updatedTestimonial);
      // Actualiza la lista de testimonios con la nueva reseña
      setTestimonials((prev) =>
        prev.map((testimonial) =>
          testimonial.testimonio_id === id
            ? { ...testimonial, ...data }
            : testimonial
        )
      );
      setIsModalOpen(false); // Cerrar el modal después de guardar
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Gestionar Reseñas
        </h1>

        {/* Filtros */}
        <div className="flex justify-between mb-6">
          <div className="flex space-x-4">
            <select
              value={filterStars || ""}
              onChange={(e) => setFilterStars(e.target.value || null)}
              className="py-1 px-3 text-sm border-2 rounded-lg bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
            >
              <option value="">Filtrar por Estrellas</option>
              <option value="5">★★★★★ (5 estrellas)</option>
              <option value="4">★★★★☆ (4 estrellas)</option>
              <option value="3">★★★☆☆ (3 estrellas)</option>
              <option value="2">★★☆☆☆ (2 estrellas)</option>
              <option value="1">★☆☆☆☆ (1 estrella)</option>
            </select>

            <button
              onClick={() => setFilterOwn(!filterOwn)}
              className={`py-2 px-4 text-sm border-2 rounded-lg ${
                filterOwn
                  ? "bg-sgreen text-white border-green-500"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              } ${(!token || !user || user.rol_id === 2) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!token || !user || user.rol_id === 2}
              title={(!token || !user) ? 'Debes iniciar sesión para ver tus reseñas' : user.rol_id === 2 ? 'Los administradores no tienen reseñas propias' : ''}
            >
              {filterOwn ? "Ver Todas las Reseñas" : "Ver Solo Mis Reseñas"}
            </button>
          </div>

          {/* Botón para crear nueva reseña - solo para usuarios normales (no administradores) */}
          {token && user && user.rol_id !== 2 && (
            <button
              onClick={() => navigate('/testimonials/new')}
              className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
            >
              Crear Nueva Reseña
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Cargando testimonios...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No se encontraron testimonios.</p>
            {filterOwn && (
              <p className="mt-2 text-sm">
                Aún no has creado ninguna reseña. ¡Crea tu primera reseña!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.testimonio_id}
                className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-medium text-gray-700">
                  {`${testimonial.nombre || "Anónimo"} ${
                    testimonial.apellido_paterno || ""
                  } ${testimonial.apellido_materno || ""}`}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-xs">
                    {"★".repeat(testimonial.estrellas || 0)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    testimonial.nombre_estado === 'Confirmado' 
                      ? 'bg-green-100 text-green-800' 
                      : testimonial.nombre_estado === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testimonial.nombre_estado}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mt-2">
                  {testimonial.contenido || "Sin contenido disponible"}
                </p>
                <p className="text-gray-500 text-xs">
                  Fecha:{" "}
                  {new Date(testimonial.fecha_creacion).toLocaleDateString()}
                </p>

                {/* Mostrar botones de edición y eliminación solo para las reseñas propias */}
                {user && testimonial.usuario_id === user.usuario_id && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="bg-blue-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.testimonio_id)}
                      className="bg-red-500 text-white py-1 px-3 text-sm rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Paginación */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`py-2 px-4 text-sm border-2 rounded-lg ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-sgreen text-white border-green-500 hover:bg-green-600"
            }`}
          >
            Anterior
          </button>
          <span className="text-lg text-gray-700">Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`py-2 px-4 text-sm border-2 rounded-lg ${
              currentPage >= totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-sgreen text-white border-green-500 hover:bg-green-600"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal para editar la reseña */}
      <EditTestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testimonialData={selectedTestimonial}
        onSave={handleSave}
      />
    </section>
  );
};

export default ManageTestimonials;
