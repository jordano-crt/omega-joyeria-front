// Utilities para manejo de fechas sin problemas de timezone

/**
 * Formatea una fecha para ser enviada al backend evitando problemas de timezone
 * @param {Date} date - La fecha a formatear
 * @returns {string} - Fecha en formato YYYY-MM-DDTHH:mm:ss
 */
export const formatDateForBackend = (date) => {
  if (!date || !(date instanceof Date)) {
    throw new Error('Se requiere una fecha válida');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Formatea una fecha para mostrar en el formato local
 * @param {string|Date} dateString - La fecha a formatear
 * @returns {string} - Fecha formateada para mostrar
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para inputs de tipo date
 * @returns {string} - Fecha actual en formato YYYY-MM-DD
 */
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha y hora separadas en un objeto Date
 * @param {string|Date} dateInput - Fecha en formato YYYY-MM-DD o objeto Date
 * @param {number} hour - Hora en formato 24h
 * @param {number} minute - Minutos (opcional, por defecto 0)
 * @returns {Date} - Objeto Date
 */
export const createDateFromParts = (dateInput, hour, minute = 0) => {
  if ((!dateInput && dateInput !== 0) || hour === undefined) {
    throw new Error('Se requiere fecha y hora');
  }

  let date;
  if (dateInput instanceof Date) {
    // Si ya es un objeto Date, crear una copia
    date = new Date(dateInput);
  } else {
    // Si es un string, crear Date desde el string
    date = new Date(dateInput);
  }
  
  date.setHours(hour, minute, 0, 0);
  return date;
};
