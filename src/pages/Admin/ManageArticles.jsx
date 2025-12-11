import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';
import Modal from '../../components/Modal'; // Ruta ajustada al archivo del modal

const ManageArticles = () => {
  const { token } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (!token) {
          throw new Error('Usuario no autenticado. Inicia sesión nuevamente.');
        }

        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/blog', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los artículos');
        }

        const data = await response.json();
        if (Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else {
          console.error('La respuesta del backend no es un array:', data);
          setArticles([]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [token]);

  const toggleModal = () => setShowModal(!showModal);

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/blog/${articleToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setArticles((prevArticles) =>
          prevArticles.filter((article) => article.publicacion_id !== articleToDelete)
        );
        alert('Artículo eliminado con éxito');
      } else {
        const errorData = await response.json();
        console.error('Error desde el backend:', errorData);
        alert(errorData.message || 'No se pudo eliminar el artículo.');
      }
    } catch (error) {
      console.error('Error al eliminar el artículo:', error.message);
      alert('No se pudo eliminar el artículo.');
    } finally {
      toggleModal();
    }
  };

  const requestDelete = (id) => {
    setArticleToDelete(id);
    toggleModal();
  };

  const handleEdit = (id) => {
    navigate(`/admin/blog/edit/${id}`);
  };

  const handleCreate = () => {
    navigate(`/admin/blog/new`);
  };

  if (loading) {
    return <div className="text-center mt-10">Cargando artículos...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 font-ibm bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">Gestión de Artículos</h1>
      <button
        onClick={handleCreate}
        className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out mb-4"
        aria-label="Crear Nuevo Artículo"
      >
        Crear Nuevo Artículo
      </button>
      <div className="overflow-x-auto rounded-2xl border border-gray-300">
        <table className="min-w-full table-auto border-collapse bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Título
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Fecha de Publicación
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.length > 0 ? (
              articles.map((article) => (
                <tr key={article.publicacion_id} className="hover:bg-gray-50 border-b border-gray-300">
                  <td className="px-6 py-3 text-gray-800">{article.titulo}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(article.fecha_publicacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleEdit(article.publicacion_id)}
                      className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out mr-2"
                      aria-label={`Editar artículo ${article.titulo}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => requestDelete(article.publicacion_id)}
                      className="bg-white text-sgreen py-2 px-3 rounded-2xl border border-gray-300 hover:bg-gray-200 transition duration-300 ease-in-out"
                      aria-label={`Eliminar artículo ${article.titulo}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-600 font-medium border-b border-gray-300"
                >
                  No hay artículos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        showModal={showModal}
        toggleModal={toggleModal}
        onConfirm={confirmDelete}
        loading={false}
        title="Eliminar artículo"
        message="¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ManageArticles;
