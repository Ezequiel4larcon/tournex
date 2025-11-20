import { useContext } from 'react';
import { ForumContext } from '../context/ForumContext';

/**
 * Hook personalizado para acceder al contexto del foro
 */
export const useComments = () => {
  const context = useContext(ForumContext);
  
  if (!context) {
    throw new Error('useComments debe ser usado dentro de un ForumProvider');
  }
  
  return context;
};
