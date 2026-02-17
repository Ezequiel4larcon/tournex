import { useEffect } from 'react';

/**
 * Hook para cerrar modales/paneles al presionar la tecla Escape
 * @param {boolean} isActive - Si el modal/panel está visible
 * @param {Function} onClose - Función para cerrar el modal/panel
 */
export const useEscapeKey = (isActive, onClose) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);
};
