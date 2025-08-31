import React, { useState, useEffect, useContext, Suspense } from 'react';
import { AuthContext } from '../../services/authContext';
import userImageDefault from '../../assets/userdefect.png';
import { useNavigate } from 'react-router-dom';
import { getCroppedImg } from '../../utils/cropImage';
import { getProfile, updateProfile, deleteAccount } from '../../services/authService';
import debounce from 'lodash.debounce';  
import imageCompression from 'browser-image-compression'; 
import Modal from '../../components/Modal';
import userBackground from '../../assets/user_background.jpg';

const LazyCropper = React.lazy(() => import('react-easy-crop'));

const UserProfile = () => {
  const { logoutUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);  
  const [cropArea, setCropArea] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const hiddenFileInput = React.useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getProfile();
        setFormData({
          nombre: data.nombre,
          apellido_paterno: data.apellido_paterno,
          apellido_materno: data.apellido_materno,
          correo_electronico: data.correo_electronico,
          telefono: data.telefono || '',
          direccion: data.direccion || '',
        });
        setOriginalData({
          nombre: data.nombre,
          apellido_paterno: data.apellido_paterno,
          apellido_materno: data.apellido_materno,
          correo_electronico: data.correo_electronico,
          telefono: data.telefono || '',
          direccion: data.direccion || '',
        });
        setProfileImage(data.foto_perfil_url ? data.foto_perfil_url : userImageDefault);
        setLoading(false);
      } catch (error) {
        console.error('Error en la petición de perfil:', error);
        setError('Error al cargar el perfil.');
      }
    };

    fetchProfileData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const imageUrl = URL.createObjectURL(compressedFile);
      setProfileImage(imageUrl);
      setShowCropper(true);
    } catch (error) {
      setError('Error al procesar la imagen.');
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      hiddenFileInput.current.click();
    }
  };

  const handleSaveCroppedImage = async () => {
    try {
      // Obtén la imagen recortada
      const croppedImgUrl = await getCroppedImg(profileImage, cropArea);
      
      // Actualiza la imagen recortada
      setCroppedImage(croppedImgUrl);
      setProfileImage(croppedImgUrl);  // Actualiza la imagen en el perfil principal

      setShowCropper(false);  // Cierra el cropper modal
    } catch (error) {
      setError('Error al recortar la imagen.');
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
  };

  const validateForm = debounce(() => {
    if (!formData.nombre || !formData.apellido_paterno || !formData.correo_electronico) {
      setError('Los campos Nombre, Apellido Paterno y Correo Electrónico son obligatorios.');
      return false;
    }
    return true;
  }, 300);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    validateForm();
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    if (JSON.stringify(formData) === JSON.stringify(originalData) && !croppedImage) {
      setMessage('No se realizaron cambios.');
      return;
    }

    const formDataToSend = new FormData();
    for (let key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    if (croppedImage) {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      formDataToSend.append('foto_perfil', blob, 'profile.jpg');
    }

    try {
      const response = await fetch('http://localhost:4000/usuarios/perfil', {
        method: 'PUT',
        headers: {
          'x-auth-token': sessionStorage.getItem('token'),
          'X-CSRF-Token': sessionStorage.getItem('csrf_token')
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Datos inválidos. Por favor, revisa tu información.');
        } else if (response.status === 401) {
          throw new Error('No tienes permiso para realizar esta acción.');
        } else {
          throw new Error('Error al actualizar el perfil. Intenta nuevamente.');
        }
      }

      setMessage('Perfil actualizado correctamente.');
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    setLoadingDelete(true);
    try {
      await deleteAccount();
      logoutUser();
      navigate('/');
    } catch (error) {
      setError('Error al eliminar la cuenta');
    } finally {
      setLoadingDelete(false);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  if (loading) {
    return <div className="text-center">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 mt-10 p-0 bg-white rounded-2xl overflow-hidden border border-gray-200">
      
      {/* Encabezado con imagen */}
      <div className="relative">
        <img
          src={userBackground}
          alt="Fondo decorativo"
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white w-40 h-40 bg-gray-200"> {/* Imagen más grande */}
          <img
            src={croppedImage ? croppedImage : profileImage ? profileImage : userImageDefault}
            alt="User"
            className="w-full h-full object-cover rounded-full"
            onClick={handleImageClick}
            aria-label="Imagen de perfil"
          />
          <input
            type="file"
            ref={hiddenFileInput}
            onChange={handleImageChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>
        {/* Botón para cambiar la imagen, dentro del fondo decorativo */}
        {isEditing && (
          <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleImageClick}
              className="bg-white border border-sgreen text-sgreen py-1 px-4 rounded-full hover:bg-white"
            >
              Cambiar Imagen
            </button>
          </div>
        )}
      </div>

      {/* Nombre del Usuario */}
      <div className="text-center mt-8 text-3xl font-semibold text-green-700">
        {`${formData.nombre || 'Nombre'} ${formData.apellido_paterno || 'Apellido Paterno'} ${formData.apellido_materno || 'Apellido Materno'}`}
      </div>

      {/* Formulario */}
      <div className="mt-6 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-600">Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre || ''}
            disabled={!isEditing}
            onChange={handleInputChange}
            className={`w-full p-2 mt-1 border rounded-2xl transition-all duration-300 ${
              isEditing
                ? 'border-sgreen bg-white scale-105 shadow-md'
                : 'border-gray-300 bg-gray-100 scale-100'
            }`}
          />
        </div>
        <div>
          <label className="block text-gray-600">Apellido Paterno:</label>
          <input
            type="text"
            name="apellido_paterno"
            value={formData.apellido_paterno || ''}
            disabled={!isEditing}
            onChange={handleInputChange}
            className={`w-full p-2 mt-1 border rounded-2xl transition-all duration-300 ${
              isEditing
                ? 'border-sgreen bg-white scale-105 shadow-md'
                : 'border-gray-300 bg-gray-100 scale-100'
            }`}
          />
        </div>
        <div>
          <label className="block text-gray-600">Apellido Materno:</label>
          <input
            type="text"
            name="apellido_materno"
            value={formData.apellido_materno || ''}
            disabled={!isEditing}
            onChange={handleInputChange}
            className={`w-full p-2 mt-1 border rounded-2xl transition-all duration-300 ${
              isEditing
                ? 'border-sgreen bg-white scale-105 shadow-md'
                : 'border-gray-300 bg-gray-100 scale-100'
            }`}
          />
        </div>
        <div>
          <label className="block text-gray-600">Correo Electrónico:</label>
          <input
            type="email"
            name="correo_electronico"
            value={formData.correo_electronico || ''}
            disabled
            className="w-full p-2 mt-1 border rounded-2xl bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-600">Teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono || ''}
            disabled={!isEditing}
            onChange={handleInputChange}
            className={`w-full p-2 mt-1 border rounded-2xl transition-all duration-300 ${
              isEditing
                ? 'border-sgreen bg-white scale-105 shadow-md'
                : 'border-gray-300 bg-gray-100 scale-100'
            }`}
          />
        </div>
        <div>
          <label className="block text-gray-600">Dirección:</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion || ''}
            disabled={!isEditing}
            onChange={handleInputChange}
            className={`w-full p-2 mt-1 border rounded-2xl transition-all duration-300 ${
              isEditing
                ? 'border-sgreen bg-white scale-105 shadow-md'
                : 'border-gray-300 bg-gray-100 scale-100'
            }`}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-8 mb-10 flex justify-center space-x-4">
        {isEditing ? (
          <>
            <button 
              onClick={handleSaveProfile} 
              className="bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition duration-300 ease-in-out"
              aria-label="Guardar cambios"
            >
              Guardar Cambios
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition" /* Mismo estilo para "Cancelar" */
              aria-label="Cancelar edición"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition duration-300 ease-in-out"
              aria-label="Editar perfil"
            >
              Editar Perfil
            </button>
            <button
              onClick={toggleModal}
              className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition"
              aria-label="Eliminar cuenta"
            >
              Eliminar Cuenta
            </button>
          </>
        )}
      </div>

      {/* Modal para confirmar eliminación de cuenta */}
      <Modal
        showModal={showModal}
        toggleModal={toggleModal}
        handleDeleteAccount={handleDeleteAccount}
        loadingDelete={loadingDelete}
      />

      {/* Modal de Cropper */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96">
            <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">Recortar Imagen</h2>
            <Suspense fallback={<div>Cargando cropper...</div>}>
              <div className="relative w-full h-80 bg-gray-200">
                <LazyCropper
                  image={profileImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(croppedArea, croppedAreaPixels) => setCropArea(croppedAreaPixels)}
                />
              </div>
            </Suspense>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleSaveCroppedImage}
                className="bg-sgreen text-white py-2 px-4 rounded-2xl hover:bg-bgreen"
              >
                Guardar Imagen
              </button>
              <button
                onClick={handleCancelCrop}
                className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition" /* Estilo coherente para "Cancelar" */
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;