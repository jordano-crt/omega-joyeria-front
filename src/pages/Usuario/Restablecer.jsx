import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { motion } from 'framer-motion';
import { AiOutlineLoading } from 'react-icons/ai';
import logo from '../../assets/Logo.svg';

const ResetPassword = () => {
  const location = useLocation(); // Obtén el estado pasado
  const navigate = useNavigate(); // Inicializa useNavigate
  const [formData, setFormData] = useState({
    email: location.state?.email || '', // Usa el email pasado o un valor vacío
    codigo: '',
    nuevaContrasena: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:4000/usuarios/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_electronico: formData.email,
          codigo: formData.codigo,
          nuevaContrasena: formData.nuevaContrasena,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al restablecer la contraseña.');
      }

      setSuccessMessage('Tu contraseña ha sido restablecida exitosamente.');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen font-ibm flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white p-8 rounded-2xl w-full max-w-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.img
          src={logo}
          alt="Logo"
          className="mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <p className="text-center text-gray-500 mb-4">
          Ingresa tu código y nueva contraseña
        </p>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
            required
          />

          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
            Código
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
            required
          />

          <label htmlFor="nuevaContrasena" className="block text-sm font-medium text-gray-700">
            Nueva Contraseña
          </label>
          <input
            type="password"
            name="nuevaContrasena"
            value={formData.nuevaContrasena}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
            required
          />

          <motion.button
            type="submit"
            className="w-full bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 hover:shadow-inner-hgreen transition duration-300 ease-in-out"
            whileHover={!loading && { scale: 1.05 }}
            whileTap={!loading && { scale: 0.95 }}
            disabled={loading}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block mr-2"
              >
                <AiOutlineLoading size={20} />
              </motion.span>
            ) : (
              'Restablecer Contraseña'
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;
