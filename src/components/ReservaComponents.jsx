import React, { useState, useEffect } from 'react';

const ReservaTimer = ({ fechaExpiracion, onExpire }) => {
  const [tiempoRestante, setTiempoRestante] = useState('');

  useEffect(() => {
    const actualizarTimer = () => {
      const ahora = new Date().getTime();
      const expiracion = new Date(fechaExpiracion).getTime();
      const tiempoRestante = expiracion - ahora;

      if (tiempoRestante > 0) {
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
        setTiempoRestante(`${minutos}:${segundos.toString().padStart(2, '0')}`);
      } else {
        setTiempoRestante('EXPIRADO');
        if (onExpire) {
          onExpire();
        }
      }
    };

    const interval = setInterval(actualizarTimer, 1000);
    actualizarTimer();

    return () => clearInterval(interval);
  }, [fechaExpiracion, onExpire]);

  return (
    <span className={`font-bold ${tiempoRestante === 'EXPIRADO' ? 'text-red-600' : 'text-orange-600'}`}>
      {tiempoRestante}
    </span>
  );
};

const ReservaInfo = ({ reserva, onConfirm, onCancel, onExpire }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
      <h4 className="flex items-center text-yellow-800 font-semibold mb-3">
        <span className="mr-2">🕐</span>
        Reserva Activa
      </h4>
      <div className="text-yellow-700 space-y-2">
        <p>
          <strong>Cantidad reservada:</strong> {reserva.cantidad_reservada}
        </p>
        <p>
          <strong>Expira en:</strong>{' '}
          <ReservaTimer 
            fechaExpiracion={reserva.fecha_expiracion} 
            onExpire={onExpire}
          />
        </p>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => onConfirm(reserva.reserva_id)}
          className="bg-sgreen text-white py-2 px-4 rounded-2xl border-2 border-green-500 shadow-inner-green hover:scale-105 transition duration-300 ease-in-out"
        >
          ✅ Confirmar Compra
        </button>
        <button
          onClick={() => onCancel(reserva.reserva_id)}
          className="bg-red-500 text-white py-2 px-4 rounded-2xl shadow-inner-red hover:shadow-inner-hred transition duration-300 ease-in-out"
        >
          ❌ Cancelar Reserva
        </button>
      </div>
    </div>
  );
};

export { ReservaInfo, ReservaTimer };