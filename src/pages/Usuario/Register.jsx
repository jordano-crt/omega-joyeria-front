import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { register } from '../../services/authService';
import { getCroppedImg } from '../../utils/cropImage';
import { FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import logo from '../../assets/Logo.svg';
import userImageDefault from '../../assets/userdefect.png';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo_electronico: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hiddenFileInput = useRef(null);
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setShowCropper(true);
    }
  };

  const handleSaveCroppedImage = async () => {
    try {
      const croppedImg = await getCroppedImg(profileImage, cropArea);
      setCroppedImage(croppedImg);
      setShowCropper(false);
    } catch (error) {
      setError('Error al recortar la imagen.');
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setProfileImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1 && formData.nombre && formData.apellido_paterno && formData.apellido_materno) {
      setError(null);
      setStep(2);
    } else if (step === 2 && formData.contrasena === formData.confirmarContrasena) {
      setError(null);
      setStep(3);
    } else if (step === 3) {
      try {
        setIsLoading(true);
        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));

        if (croppedImage) {
          const response = await fetch(croppedImage);
          const blob = await response.blob();
          formDataToSend.append('foto_perfil', blob, 'profile.jpg');
        }

        await register(formDataToSend);
        setIsLoading(false);
        setIsRegistered(true);
      } catch (error) {
        setError(error.message || 'Error al registrar usuario.');
        setIsLoading(false);
      }
    } else {
      setError('Por favor, complete todos los campos correctamente.');
    }
  };

  useEffect(() => {
    if (isRegistered) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      if (countdown === 0) {
        navigate('/login');
      }

      return () => clearInterval(timer);
    }
  }, [isRegistered, countdown, navigate]);

  const renderProgressIndicator = () => (
    <div className="flex justify-center items-center mb-6">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
              step >= stepNum ? 'bg-sgreen text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div
              className={`h-1 w-8 sm:w-12 lg:w-16 transition-colors duration-300 ${
                step > stepNum ? 'bg-sgreen' : 'bg-gray-300'
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      className="min-h-screen font-ibm flex items-center justify-center bg-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white p-8 rounded-2xl w-full max-w-sm mt-4"
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

        {isRegistered ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">¡Registro exitoso!</h2>
            <p>Te redirigiremos al inicio de sesión en {countdown} segundos...</p>
            <motion.button
              onClick={() => navigate('/login')}
              className="mt-4 bg-sgreen text-white px-4 py-2 rounded-2xl hover:bg-green-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ir al Login ahora
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="relative flex items-center mb-4">
              <button
                onClick={() => navigate('/')}
                className="bg-sgreen text-white p-2 rounded-full hover:bg-bgreen absolute left-0"
              >
                <FaHome className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-center w-full">Regístrate</h2>
            </div>

            {renderProgressIndicator()}

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-3"
              encType="multipart/form-data"
              role="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {step === 1 && (
                <>
                  <InputField label="Nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} required />
                  <InputField label="Apellido Paterno" name="apellido_paterno" type="text" value={formData.apellido_paterno} onChange={handleChange} required />
                  <InputField label="Apellido Materno" name="apellido_materno" type="text" value={formData.apellido_materno} onChange={handleChange} required />
                  <motion.button
                    type="submit"
                    className="w-full bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition duration-300 ease-in-out"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Siguiente
                  </motion.button>
                </>
              )}

              {step === 2 && (
                <>
                  <InputField label="Correo Electrónico" name="correo_electronico" type="email" value={formData.correo_electronico} onChange={handleChange} required />
                  <InputField label="Contraseña" name="contrasena" type="password" value={formData.contrasena} onChange={handleChange} required />
                  <InputField label="Confirmar Contraseña" name="confirmarContrasena" type="password" value={formData.confirmarContrasena} onChange={handleChange} required />
                  <motion.button
                    type="submit"
                    className="w-full bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition duration-300 ease-in-out"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Siguiente
                  </motion.button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="flex justify-center mb-4">
                    <img
                      src={croppedImage ? croppedImage : profileImage ? profileImage : userImageDefault}
                      alt="User"
                      className="w-24 h-24 rounded-full border-2 border-gray-300 cursor-pointer"
                      onClick={() => hiddenFileInput.current.click()}
                      aria-label="User profile image"
                    />
                    <input
                      type="file"
                      ref={hiddenFileInput}
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                      aria-label="Upload profile image"
                    />
                  </div>

                  <InputField label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="+56 X XXXX XXXX" required />
                  <InputField label="Dirección" name="direccion" type="text" value={formData.direccion} onChange={handleChange} />

                  <motion.button
                    type="submit"
                    className="w-full bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition duration-300 ease-in-out"
                    disabled={isLoading}
                    whileHover={!isLoading && { scale: 1.05 }}
                    whileTap={!isLoading && { scale: 0.95 }}
                  >
                    {isLoading ? 'Registrando...' : 'Registrar'}
                  </motion.button>
                </>
              )}
            </motion.form>

            {showCropper && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-4 rounded-lg w-80">
                  <h2 className="text-center font-bold mb-4">Recortar Imagen</h2>
                  <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <Cropper
                      image={profileImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(croppedArea, croppedAreaPixels) => setCropArea(croppedAreaPixels)}
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <motion.button
                      onClick={handleSaveCroppedImage}
                      className="bg-sgreen hover:bg-bgreen text-white py-2 px-4 rounded-2xl mr-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Guardar
                    </motion.button>
                    <motion.button
                      onClick={handleCancelCrop}
                      className="bg-white border border-sgreen text-sgreen py-2 px-4 rounded-2xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ label, name, type, value, onChange, placeholder = '', required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
      placeholder={placeholder}
      required={required}
      aria-label={label}
    />
  </div>
);

export default Register;
