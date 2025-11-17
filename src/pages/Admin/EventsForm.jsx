import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";

// Registrar localización en español
registerLocale('es', es);

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

  const handleDateChange = (date, fieldName) => {
    setForm({ ...form, [fieldName]: date ? date.toISOString() : '' });
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
        <label className="block font-medium mb-1 text-gray-700">
          Fecha y hora de inicio
        </label>
        <DatePicker
          selected={form.fecha_inicio ? new Date(form.fecha_inicio) : null}
          onChange={(date) => handleDateChange(date, 'fecha_inicio')}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
          locale="es"
          placeholderText="Selecciona fecha y hora"
          className="w-full border p-2 rounded"
          required
        />
      </div>

      {/* Fecha de fin */}
      <div>
        <label className="block font-medium mb-1 text-gray-700">
          Fecha y hora de finalización
        </label>
        <DatePicker
          selected={form.fecha_fin ? new Date(form.fecha_fin) : null}
          onChange={(date) => handleDateChange(date, 'fecha_fin')}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
          locale="es"
          placeholderText="Selecciona fecha y hora"
          className="w-full border p-2 rounded"
          required
          minDate={form.fecha_inicio ? new Date(form.fecha_inicio) : new Date()}
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