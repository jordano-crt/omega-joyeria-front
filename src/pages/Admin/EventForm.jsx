import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';

const EventForm = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams(); // undefined si es nuevo
  const location = useLocation();
  const isEditing = Boolean(id);

  // Si viene desde editar, toma los datos del evento del location.state
  const initialEvent = location.state?.evento || {
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    capacidad: ''
  };

  const [form, setForm] = useState(initialEvent);

  useEffect(() => {
    // Si no hay datos en el state y es edición, cargar desde la API
    if (isEditing && !location.state?.evento) {
      fetch(`http://localhost:4000/eventos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setForm(data))
        .catch(() => alert('Error al cargar el evento'));
    }
  }, [id, token, isEditing, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://localhost:4000/eventos/${id}` : 'http://localhost:4000/eventos';

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      navigate('/admin/events');
    } catch (error) {
      alert('Error al guardar el evento');
    }
  };

  return (
  <div className="max-w-3xl mx-auto p-6 bg-white mt-8 mb-8">
    <h2 className="text-2xl font-semibold mb-4">
      {isEditing ? 'Editar Evento' : 'Crear Evento'}
    </h2>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campos de texto: nombre, descripción, ubicación */}
      {[
        { name: 'nombre', label: 'Nombre del evento' },
        { name: 'descripcion', label: 'Descripción' },
        { name: 'ubicacion', label: 'Ubicación' },
      ].map(({ name, label }) => (
        <div key={name}>
          <label htmlFor={name} className="block font-medium mb-1 text-gray-700">
            {label}
          </label>
          <input
            id={name}
            name={name}
            type="text"
            value={form[name]}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
      ))}

      {/* Fecha de inicio */}
      <div>
        <label htmlFor="fecha_inicio" className="block font-medium mb-1 text-gray-700">
          Fecha y hora de inicio
        </label>
        <input
          type="datetime-local"
          id="fecha_inicio"
          name="fecha_inicio"
          value={form.fecha_inicio?.slice(0, 16) || ''}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Fecha de fin */}
      <div>
        <label htmlFor="fecha_fin" className="block font-medium mb-1 text-gray-700">
          Fecha y hora de finalización
        </label>
        <input
          type="datetime-local"
          id="fecha_fin"
          name="fecha_fin"
          value={form.fecha_fin?.slice(0, 16) || ''}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Capacidad */}
      <div>
        <label htmlFor="capacidad" className="block font-medium mb-1 text-gray-700">
          Capacidad
        </label>
        <input
          type="number"
          id="capacidad"
          name="capacidad"
          value={form.capacidad}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">
        {isEditing ? 'Actualizar' : 'Crear'}
      </button>
    </form>
  </div>
);

};

export default EventForm;
