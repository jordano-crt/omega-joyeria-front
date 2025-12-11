import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import { motion } from 'framer-motion';

const ArticleDetail = () => {
  const { id } = useParams(); // Obtener el ID de la URL
  const navigate = useNavigate(); // Para volver atrás
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${BASE_URL}/blog/${id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el artículo');
        }
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const articleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  if (!article) {
    return <div className="text-center mt-10">No se encontró el artículo</div>;
  }

  return (
    <motion.section
      className="py-12 bg-white font-ibm container mx-auto px-6 md:px-12 lg:px-48"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={articleVariants}
    >
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-semibold text-gray-800">{article.titulo}</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
          >
            Volver Atrás
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Publicado el: {new Date(article.fecha_publicacion).toLocaleDateString()}
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">{article.contenido}</p>
        {article.secciones && article.secciones.length > 0 && (
          <div className="space-y-6">
            {article.secciones.map((section) => (
              <div key={section.seccion_id} className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{section.subtitulo}</h2>
                <p className="text-gray-700 leading-relaxed">{section.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default ArticleDetail;
