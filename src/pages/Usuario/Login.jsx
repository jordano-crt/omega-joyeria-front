import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { AuthContext } from '../../services/authContext';
import { motion } from 'framer-motion';
import { AiOutlineLoading, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import logo from '../../assets/logo.svg';
import googleLogo from '../../assets/google.png';

const Login = () => {
  const [formData, setFormData] = useState({
    correo_electronico: '',
    contrasena: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await login(formData); // Llama al servicio de login
      console.log("Datos recibidos desde el backend:", response); // Log para depurar
  
      // Asegúrate de pasar `usuario_id` junto con los otros datos al contexto
      loginUser({
        usuario_id: response.usuario_id || response.userId || response.id || response.nombre, // acepta cualquiera
        nombre: response.nombre,
        token: response.token,
        foto_perfil_url: response.foto_perfil_url,
        rol_id: response.rol_id, // Incluye el rol_id
      });
  
      // Redirigir según el rol del usuario
      if (response.rol_id === 2) {
        navigate('/admin'); // Redirige al panel de administración
      } else {
        navigate('/'); // Redirige al inicio para usuarios normales
      }
  
      setError(null); // Limpia los errores previos
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };
  


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        <p className="text-center text-gray-500 mb-4">Introduce tus datos para iniciar sesión</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              name="correo_electronico"
              placeholder="ejemplo@correo.com"
              value={formData.correo_electronico}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
              required
            />
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                placeholder="Ingresa tu contraseña"
                value={formData.contrasena}
                onChange={handleChange}
                className="mt-1 p-2 pr-10 border border-gray-300 rounded-2xl w-full"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} className="text-gray-500" />
                ) : (
                  <AiOutlineEye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
          </motion.div>
          <a
            href="/forgot-password"
            className="block text-sm text-center text-sgreen hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
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
              "Iniciar Sesión"
            )}
          </motion.button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">o</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <motion.button
          className="flex items-center justify-center w-full border border-gray-300 px-4 py-2 rounded-2xl hover:bg-gray-100 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5 mr-2" />
          Iniciar sesión con Google
        </motion.button>
        <p className="text-center text-gray-500 mt-4">
          ¿No tienes una cuenta? <a href="/register" className="text-sgreen hover:underline">Regístrate</a>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
