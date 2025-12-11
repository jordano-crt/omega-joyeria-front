import { useState, useEffect } from "react";
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(null); // Artículo individual
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const articlesPerPage = 5;
  const { articleId } = useParams(); // Captura el parámetro del artículo (si existe)

  const fetchArticles = async (page) => {
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/blog?limit=${articlesPerPage}&page=${page}`);
      if (!response.ok) {
        throw new Error("Error al cargar los artículos");
      }
      const data = await response.json();

      setArticles(data.articles || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchArticle = async (id) => {
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/blog/${id}`);
      if (!response.ok) {
        throw new Error("Error al cargar el artículo");
      }
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchArticle(articleId);
    } else {
      fetchArticles(currentPage);
    }
  }, [articleId, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setArticles([]); // Limpia las tarjetas antes de la transición
      fetchArticles(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setArticles([]); // Limpia las tarjetas antes de la transición
      fetchArticles(currentPage - 1);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
  };

  const paginationVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (article) {
    return (
      <motion.section
        className="py-12 bg-white font-ibm container mx-auto px-6 md:px-12 lg:px-48"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cardVariants}
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <h1 className="text-4xl font-semibold text-gray-800 mb-6">
            {article.titulo}
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Publicado el:{" "}
            {new Date(article.fecha_publicacion).toLocaleDateString()}
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            {article.contenido}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
          >
            Volver Atrás
          </button>
        </div>
      </motion.section>
    );
  }

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-5xl font-semibold text-center mb-10 mt-10 text-gray-800">
          Blog y Artículos Informativos
        </h1>

        <p className="text-lg text-gray-700 text-left mb-8">
          Bienvenido a nuestro blog, el espacio donde compartimos las últimas
          novedades, consejos y tendencias del mundo de la relojería y la
          joyería. Aquí encontrarás artículos exclusivos escritos por expertos
          que te ayudarán a conocer más sobre el cuidado, la historia y las
          innovaciones de tus piezas favoritas.
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            key={currentPage}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              exit: { opacity: 0 },
            }}
          >
            {articles.map((article) => (
              <motion.div
                key={article.publicacion_id}
                className="bg-white hover:bg-gray-100 transition-colors duration-200 rounded-2xl p-4 cursor-pointer border border-gray-200 shadow-sm flex flex-col justify-between"
                style={{ height: "250px" }}
                variants={cardVariants}
              >
                <div className="flex-grow">
                  <h2 className="text-lg font-medium text-gray-700 mb-1 line-clamp-2">
                    {article.titulo}
                  </h2>
                  <p className="text-gray-600 text-xs mb-2">
                    Publicado el:{" "}
                    {new Date(article.fecha_publicacion).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {article.contenido}
                  </p>
                </div>
                <motion.button
                  className="bg-sgreen text-white py-1 px-3 text-sm border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out mt-4"
                  onClick={() => navigate(`/blog/${article.publicacion_id}`)}
                  whileHover="hover"
                  whileTap="tap"
                  variants={paginationVariants}
                >
                  Leer más
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Controles de paginación */}
        <div className="flex justify-center items-center mt-10 space-x-4">
          <motion.button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`py-1 px-3 text-sm border-2 rounded-2xl transition duration-300 ease-in-out ${
              currentPage === 1
                ? "bg-white text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-sgreen text-white border-green-500 hover:shadow-inner-hgreen"
            }`}
            whileHover={!currentPage === 1 && "hover"}
            whileTap={!currentPage === 1 && "tap"}
            variants={paginationVariants}
          >
            Anterior
          </motion.button>
          <span className="text-gray-700 text-lg">
            Página {currentPage} de {totalPages}
          </span>
          <motion.button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`py-1 px-3 text-sm border-2 rounded-2xl transition duration-300 ease-in-out ${
              currentPage === totalPages
                ? "bg-white text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-sgreen text-white border-green-500 hover:shadow-inner-hgreen"
            }`}
            whileHover={!currentPage === totalPages && "hover"}
            whileTap={!currentPage === totalPages && "tap"}
            variants={paginationVariants}
          >
            Siguiente
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Blog;
