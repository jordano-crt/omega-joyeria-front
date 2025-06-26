import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';

const CitaForm = ({ onSuccess, onCancel }) => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditing = Boolean(id);

  // Si viene desde editar, toma los datos de la cita del location.state
  const initialCita = location.state?.cita || {
    cliente_nombre: '',
    fecha: '',
    hora: '',
    servicio_id: 1, // Valor por defecto para 'Agendar Cita'
    notas: ''
  };

  const [form, setForm] = useState(initialCita);

  useEffect(() => {
    if (isEditing && !location.state?.cita) {
      fetch(`http://localhost:4000/citas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setForm(data))
        .catch(() => alert('Error al cargar la cita'));
    }
  }, [id, token, isEditing, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Unir fecha y hora en un solo campo fecha_hora
    const fecha_hora = `${form.fecha}T${form.hora}`;
    const estado_id = 1; // Estado por defecto (ajusta según tu lógica)
    const usuarioId = user?.id || 1; // Ajusta según tu lógica de usuario

    const citaData = {
      usuarioId,
      fecha_hora,
      servicio_id: Number(form.servicio_id),
      estado_id,
      notas: form.notas
    };

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://localhost:4000/citas/${id}` : 'http://localhost:4000/citas';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(citaData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la cita');
      }
      if (onSuccess) onSuccess();
      else navigate('/admin/citas');
    } catch (error) {
      alert(error.message || 'Error al guardar la cita');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white mt-8 mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        {isEditing ? 'Editar Cita' : 'Crear Cita'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cliente_nombre" className="block font-medium mb-1 text-gray-700">
            Nombre del Cliente
          </label>
          <input
            id="cliente_nombre"
            name="cliente_nombre"
            type="text"
            value={form.cliente_nombre}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="fecha" className="block font-medium mb-1 text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="hora" className="block font-medium mb-1 text-gray-700">
            Hora
          </label>
          <input
            type="time"
            id="hora"
            name="hora"
            value={form.hora}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="servicio_id" className="block font-medium mb-1 text-gray-700">
            Servicio
          </label>
          <select
            id="servicio_id"
            name="servicio_id"
            value={form.servicio_id}
            onChange={e => setForm({ ...form, servicio_id: Number(e.target.value) })}
            required
            className="w-full border p-2 rounded"
          >
            <option value={1}>Agendar Cita</option>
          </select>
        </div>
        <div>
          <label htmlFor="notas" className="block font-medium mb-1 text-gray-700">
            Notas
          </label>
          <textarea
            id="notas"
            name="notas"
            value={form.notas}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-sgreen text-white py-2 px-4 rounded-2xl">
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="ml-4 bg-gray-400 text-white py-2 px-4 rounded-2xl"
          >
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
};

export default CitaForm;
