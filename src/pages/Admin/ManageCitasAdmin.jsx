import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../services/authContext';
import Modal from '../../components/Modal';
import CitaForm from './CitaForm';

const ManageCitasAdmin = () => {
  const { token } = useContext(AuthContext);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        // Cambia la URL para que el admin consuma el endpoint correcto
        const response = await fetch('http://localhost:4000/citas/admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCitas(Array.isArray(data) ? data : []);
        console.log('CITAS:', Array.isArray(data) ? data : []); // <-- Verifica la estructura aquí
      } catch (err) {
        setError('Error al cargar las citas');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [token, showForm]); // recargar citas al cerrar el form

  const toggleModal = () => setShowModal(!showModal);

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/citas/${citaToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setCitas((prev) => prev.filter((cita) => cita.cita_id !== citaToDelete));
        alert('Cita eliminada con éxito');
      } else {
        alert('No se pudo eliminar la cita.');
      }
    } catch {
      alert('No se pudo eliminar la cita.');
    } finally {
      toggleModal();
    }
  };

  const requestDelete = (id) => {
    setCitaToDelete(id);
    toggleModal();
  };

  const handleEdit = (cita) => {
    // Aquí podrías implementar edición si lo deseas
  };

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  // Elimina el filtro por usuario_id para mostrar todas las citas
  const citasFiltradas = citas;

  if (loading) return <div className="text-center mt-10">Cargando citas...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 font-ibm bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">Gestión de Citas</h1>
      {!showForm && (
        <>
          <button
            onClick={handleCreate}
            className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out mb-4"
            aria-label="Agendar cita"
          >
            Agendar cita
          </button>
          <div className="overflow-x-auto rounded-2xl border border-gray-300">
            <table className="min-w-full table-auto border-collapse bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Servicio</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.length > 0 ? (
                  citasFiltradas.map((cita) => (
                    <tr key={cita.cita_id} className="hover:bg-gray-50 border-b border-gray-300">
                      <td className="px-6 py-3 text-gray-800">{cita.cliente_nombre}</td>
                      <td className="px-6 py-3 text-gray-600">{cita.fecha_hora?.split('T')[0]}</td>
                      <td className="px-6 py-3 text-gray-600">{cita.fecha_hora?.split('T')[1]?.slice(0,5)}</td>
                      <td className="px-6 py-3 text-gray-600">{cita.servicio_id}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => requestDelete(cita.cita_id)}
                          className="bg-white text-sgreen py-2 px-3 rounded-2xl border border-gray-300 hover:bg-gray-200 transition duration-300 ease-in-out"
                          aria-label={`Eliminar cita de ${cita.cliente_nombre}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-600 font-medium border-b border-gray-300">
                      No hay citas disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showForm && (
        <div>
          <CitaForm onSuccess={handleFormClose} onCancel={handleFormClose} />
        </div>
      )}
      <Modal
        showModal={showModal}
        toggleModal={toggleModal}
        onConfirm={confirmDelete}
        loading={false}
        title="Eliminar cita"
        message="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ManageCitasAdmin;
