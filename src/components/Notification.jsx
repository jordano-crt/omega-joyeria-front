import React from 'react';

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  const getTypeStyles = (tipo) => {
    switch (tipo) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl text-white font-semibold shadow-lg transform transition-all duration-300 ${getTypeStyles(notification.tipo)} ${notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-center justify-between">
        <span>{notification.mensaje}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;