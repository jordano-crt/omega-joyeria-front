import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';
import Modal from '../../components/Modal';

const ManageEventsAdmin = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:4000/eventos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setEvents(data || []);
      } catch (err) {
        setError('Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  const toggleModal = () => setShowModal(!showModal);

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:4000/eventos/${eventToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((ev) => ev.evento_id !== eventToDelete));
    } catch {
      alert('No se pudo eliminar el evento.');
    } finally {
      toggleModal();
    }
  };

  const handleCreate = () => navigate('/admin/events/new');
  const handleEdit = (evento) => {
    navigate(`/admin/events/edit/${evento.evento_id}`, { state: { evento } });
  };
  const requestDelete = (id) => {
    setEventToDelete(id);
    toggleModal();
  };

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold mb-6">Gestión de Eventos</h1>
      <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded mb-4">Crear Evento</button>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th>Nombre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Ubicación</th>
            <th>Capacidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.evento_id} className="border-t">
              <td>{ev.nombre}</td>
              <td>{new Date(ev.fecha_inicio).toLocaleDateString()}</td>
              <td>{new Date(ev.fecha_fin).toLocaleDateString()}</td>
              <td>{ev.ubicacion}</td>
              <td>{ev.capacidad}</td>
              <td>
                <button onClick={() => handleEdit(ev)} className="text-blue-500 mr-2">Editar</button>
                <button onClick={() => requestDelete(ev.evento_id)} className="text-red-500">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        showModal={showModal}
        toggleModal={toggleModal}
        onConfirm={confirmDelete}
        title="Eliminar evento"
        message="¿Seguro que quieres eliminar este evento?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ManageEventsAdmin;
