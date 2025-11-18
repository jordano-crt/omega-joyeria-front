import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';
import Modal from '../../components/Modal';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

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
      
      {/* Vista desktop - Tabla */}
      <div className="hidden md:block">
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
              <td className="p-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(ev)} 
                    className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-600 transition-colors"
                  >
                    <FiEdit2 size={14} />
                    Editar
                  </button>
                  <button 
                    onClick={() => requestDelete(ev.evento_id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-red-600 transition-colors"
                  >
                    <FiTrash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            ))}
        </tbody>
      </table>
      </div>

      {/* Vista móvil - Cards */}
      <div className="md:hidden space-y-4">
        {events.map((ev) => (
          <div key={ev.evento_id} className="bg-gray-50 border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-gray-800">{ev.nombre}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {ev.capacidad} personas
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium w-16">Inicio:</span>
                <span>{new Date(ev.fecha_inicio).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium w-16">Fin:</span>
                <span>{new Date(ev.fecha_fin).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium w-16">Lugar:</span>
                <span>{ev.ubicacion}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(ev)} 
                className="bg-blue-500 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-blue-600 transition-colors flex-1"
              >
                <FiEdit2 size={14} />
                Editar
              </button>
              <button 
                onClick={() => requestDelete(ev.evento_id)} 
                className="bg-red-500 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-red-600 transition-colors flex-1"
              >
                <FiTrash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

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