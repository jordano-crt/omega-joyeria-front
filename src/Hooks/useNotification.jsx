import { useState, useEffect } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotification({ mensaje, tipo });
  };

  const cerrarNotificacion = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  return {
    notification,
    mostrarNotificacion,
    cerrarNotificacion
  };
};