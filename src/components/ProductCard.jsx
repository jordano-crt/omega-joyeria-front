import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/authContext';
import { obtenerStock, reservarProducto, cancelarReserva, confirmarReserva } from '../services/reservasService';
import { ReservaInfo } from './ReservaComponents';
import Modal from './Modal';

const ProductCard = ({ producto, onNotification, onStockUpdate }) => {
  const { user } = useContext(AuthContext);
  const [stock, setStock] = useState(producto.stock || 0);
  const [cantidad, setCantidad] = useState(1);
  const [reservaActiva, setReservaActiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    actualizarStock();
    // Actualizar stock cada 30 segundos
    const interval = setInterval(actualizarStock, 30000);
    return () => clearInterval(interval);
  }, [producto.producto_id]);

  const actualizarStock = async () => {
    try {
      const stockInfo = await obtenerStock(producto.producto_id);
      if (stockInfo) {
        setStock(stockInfo.stock_disponible);
        
        if (onStockUpdate) {
          onStockUpdate(producto.producto_id, stockInfo.stock_disponible);
        }
    
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error);
    }
  };

  const manejarReserva = async () => {
    if (!user) {
      onNotification('Debes iniciar sesión para reservar productos', 'error');
      return;
    }

    if (cantidad < 1 || cantidad > stock) {
      onNotification('Cantidad no válida', 'error');
      return;
    }

    setModalData({
      title: 'Confirmar Reserva',
      message: `¿Estás seguro de que deseas reservar ${cantidad} unidad(es) de "${producto.nombre_producto}"? La reserva expirará en 30 minutos.`,
      onConfirm: confirmarReservaProducto,
      confirmText: 'Reservar',
      cancelText: 'Cancelar'
    });
    setShowModal(true);
  };

  const confirmarReservaProducto = async () => {
    setLoading(true);
    try {
      // Verificar stock actualizado antes de reservar
      const stockActual = await obtenerStock(producto.producto_id);
      if (!stockActual || stockActual.stock_disponible < cantidad) {
        onNotification(`Stock insuficiente. Disponible: ${stockActual?.stock_disponible || 0}`, 'error');
        await actualizarStock();
        return;
      }

      const reserva = await reservarProducto(producto.producto_id, cantidad, 30);
      
      if (reserva && reserva.reserva) {
        setReservaActiva(reserva.reserva);
        onNotification('¡Producto reservado exitosamente!', 'success');
        await actualizarStock();
      }
    } catch (error) {
      onNotification('Error al reservar: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const manejarCancelarReserva = async (reservaId) => {
    setLoading(true);
    try {
      await cancelarReserva(reservaId);
      setReservaActiva(null);
      onNotification('Reserva cancelada. Stock devuelto.', 'info');
      await actualizarStock();
    } catch (error) {
      onNotification('Error al cancelar reserva: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const manejarConfirmarReserva = async (reservaId) => {
    setLoading(true);
    try {
      await confirmarReserva(reservaId);
      setReservaActiva(null);
      onNotification('¡Reserva confirmada! Proceder al pago.', 'success');
      await actualizarStock();
    } catch (error) {
      onNotification('Error al confirmar reserva: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const manejarExpiracionReserva = () => {
    setReservaActiva(null);
    actualizarStock();
    onNotification('La reserva ha expirado. Stock devuelto.', 'info');
  };

  const stockDisponible = stock > 0;
  const maxCantidad = Math.min(stock, 10);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 transition-transform duration-300 hover:transform hover:-translate-y-1">
        {/* Imagen del producto */}
        <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
          {producto.imagen_producto ? (
            <img
              src={`http://localhost:4000/${producto.imagen_producto}`}
              alt={producto.nombre_producto}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Sin imagen
            </div>
          )}
        </div>

        {/* Información del producto */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {producto.nombre_producto}
        </h3>
        
        <p className="text-gray-600 mb-3 line-clamp-2">
          {producto.descripcion_producto}
        </p>

        <div className="text-2xl font-bold text-blue-600 mb-4">
            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Number(producto.precio_producto))}
        </div>



        {/* Stock info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Stock disponible:</span>
          <span className={`font-bold ${stockDisponible ? 'text-green-600' : 'text-red-600'}`}>
            {stockDisponible ? `${stock} unidades` : 'Agotado'}
          </span>
        </div>

        {/* Información de reserva activa */}
        {reservaActiva && (
          <ReservaInfo
            reserva={reservaActiva}
            onConfirm={manejarConfirmarReserva}
            onCancel={manejarCancelarReserva}
            onExpire={manejarExpiracionReserva}
          />
        )}

        {/* Selector de cantidad */}
        {!reservaActiva && stockDisponible && (
          <div className="flex items-center gap-3 mb-4">
            <label htmlFor={`cantidad-${producto.producto_id}`} className="text-gray-700 font-medium">
              Cantidad:
            </label>
            <input
              type="number"
              id={`cantidad-${producto.producto_id}`}
              min="1"
              max={maxCantidad}
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              className="w-16 px-3 py-2 border-2 border-gray-300 rounded-xl text-center focus:border-sgreen focus:outline-none"
              disabled={!stockDisponible}
            />
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={manejarReserva}
            disabled={!stockDisponible || reservaActiva || loading}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition duration-300 ${
              !stockDisponible || reservaActiva || loading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-sgreen text-white border-2 border-green-500 shadow-inner-green hover:scale-105'
            }`}
          >
            {loading ? (
              '⏳ Procesando...'
            ) : reservaActiva ? (
              '🕐 Reservado'
            ) : stockDisponible ? (
              '🛒 Reservar'
            ) : (
              '❌ Agotado'
            )}
          </button>

          <button
            onClick={actualizarStock}
            className="px-4 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition duration-300"
            title="Actualizar stock"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        showModal={showModal}
        toggleModal={() => setShowModal(false)}
        onConfirm={modalData?.onConfirm}
        loading={loading}
        title={modalData?.title}
        message={modalData?.message}
        confirmText={modalData?.confirmText}
        cancelText={modalData?.cancelText}
      />
    </>
  );
};

export default ProductCard;