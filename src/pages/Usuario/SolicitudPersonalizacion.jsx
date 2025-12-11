import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../services/authContext";
import DynamicUploadArea from "../../utils/fileUploader";
import { motion, AnimatePresence } from "framer-motion";

const SolicitudPersonalizacion = () => {
  const { user, token } = useContext(AuthContext);
  const uploadAreaRef = useRef(); // Referencia para DynamicUploadArea

  const [formData, setFormData] = useState({
    servicio_id: "",
    detalles: "",
  });
  const [servicios, setServicios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        if (!token) return;
        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/servicios', {
          headers: {
            "x-auth-token": token,
          },
        });
        if (!response.ok) throw new Error("Error al obtener los servicios");
        const data = await response.json();
        setServicios(data);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      }
    };

    fetchServicios();
  }, [token]);

  // Desaparecer el mensaje después de 3 segundos
  useEffect(() => {
    if (mensaje && mensaje.includes("éxito")) {
      const timer = setTimeout(() => {
        setMensaje(""); // Limpiar el mensaje después de 3 segundos
      }, 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador si el componente se desmonta
    }
  }, [mensaje]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServicioChange = (e) => {
    const servicioId = parseInt(e.target.value, 10);
    const servicio = servicios.find((s) => s.servicio_id === servicioId);
    setServicioSeleccionado(servicio);
    setFormData({ ...formData, servicio_id: servicioId });
  };

  const handleUploadFiles = (files) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.usuario_id) {
      setMensaje(
        "Error: No se pudo identificar al usuario. Por favor, inicia sesión."
      );
      return;
    }

    if (!formData.servicio_id) {
      setMensaje("Por favor selecciona un servicio válido.");
      return;
    }

    const data = new FormData();
    data.append("usuario_id", user.usuario_id);
    data.append("servicio_id", formData.servicio_id);
    data.append("detalles", formData.detalles);
    uploadedFiles.forEach((file) => data.append("imagenes", file));

    try {
      setLoading(true);

      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/personalizacion', {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error("Error en la solicitud.");
      }

      const result = await response.json();
      setMensaje("Solicitud enviada con éxito.");
      console.log("Respuesta del servidor:", result);

      // Limpiar campos después de enviar la solicitud
      setFormData({ servicio_id: "", detalles: "" });
      setServicioSeleccionado(null);

      // Limpiar DynamicUploadArea
      if (uploadAreaRef.current) {
        uploadAreaRef.current.reset();
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setMensaje("Error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-center mb-6"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-semibold text-gray-800 mb-10">
          Solicitud de Personalización
        </h1>

        <p className="text-lg text-gray-700 text-left mb-8">
          En nuestra sección de Solicitud de Personalización, puedes darle un
          toque único y especial a tus productos. Entendemos que cada cliente es
          diferente, por eso ofrecemos la posibilidad de personalizar nuestras
          piezas para adaptarlas a tus gustos, necesidades y estilo personal. Ya
          sea grabar un mensaje especial, elegir materiales específicos o
          adaptar un diseño exclusivo, nuestro equipo de expertos estará
          encantado de ayudarte a crear algo verdaderamente único. Explora las
          opciones disponibles y haz que tu producto sea tan especial como tú.
        </p>
      </motion.div>

      <motion.div
        className="p-6 font-ibm bg-white rounded-2xl border border-gray-300 shadow-md mb-20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Servicio:
            </label>
            <select
              name="servicio_id"
              value={formData.servicio_id}
              onChange={handleServicioChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map((servicio) => (
                <option key={servicio.servicio_id} value={servicio.servicio_id}>
                  {servicio.nombre_servicio}
                </option>
              ))}
            </select>
          </div>
          {servicioSeleccionado && (
            <motion.div
              className="bg-gray-100 p-4 rounded-md shadow"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p>
                <strong>Descripción:</strong> {servicioSeleccionado.descripcion}
              </p>
              <p>
                <strong>Costo:</strong> ${servicioSeleccionado.precio}
              </p>
            </motion.div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Detalles:
            </label>
            <textarea
              name="detalles"
              value={formData.detalles}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full">
            <DynamicUploadArea
              ref={uploadAreaRef}
              onUpload={handleUploadFiles}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </form>

        <AnimatePresence>
          {mensaje && (
            <motion.div
              className={`mt-4 p-4 text-white rounded-md ${
                mensaje.includes("éxito") ? "bg-green-500" : "bg-red-500"
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {mensaje}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SolicitudPersonalizacion;
