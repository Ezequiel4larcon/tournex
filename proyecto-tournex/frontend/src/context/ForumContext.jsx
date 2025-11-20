import { createContext, useState, useCallback } from 'react';
import { commentAPI, fileAPI } from '../api/forumApi';

export const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Obtener todos los comentarios
  const fetchComments = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentAPI.getAll(params);
      
      setComments(response.data.comments);
      setPagination(response.data.pagination);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al cargar comentarios');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener comentario por ID
  const fetchCommentById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentAPI.getById(id);
      
      setCurrentComment(response.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al cargar comentario');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear comentario
  const createComment = async (commentData) => {
    try {
      setError(null);
      const response = await commentAPI.create(commentData);
      
      setComments(prev => [response.data, ...prev]);
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al crear comentario');
      return { success: false, error: err };
    }
  };

  // Actualizar comentario
  const updateComment = async (id, commentData) => {
    try {
      setError(null);
      const response = await commentAPI.update(id, commentData);
      
      setComments(prev => 
        prev.map(c => c._id === id ? response.data : c)
      );
      
      if (currentComment?._id === id) {
        setCurrentComment(response.data);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al actualizar comentario');
      return { success: false, error: err };
    }
  };

  // Eliminar comentario
  const deleteComment = async (id) => {
    try {
      setError(null);
      await commentAPI.delete(id);
      
      setComments(prev => prev.filter(c => c._id !== id));
      
      if (currentComment?._id === id) {
        setCurrentComment(null);
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error al eliminar comentario');
      return { success: false, error: err };
    }
  };

  // Agregar respuesta
  const addReply = async (commentId, replyData) => {
    try {
      setError(null);
      const response = await commentAPI.addReply(commentId, replyData);
      
      if (currentComment?._id === commentId) {
        setCurrentComment(response.data);
      }
      
      setComments(prev =>
        prev.map(c => c._id === commentId ? response.data : c)
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al agregar respuesta');
      return { success: false, error: err };
    }
  };

  // Toggle like
  const toggleLike = async (commentId) => {
    try {
      setError(null);
      const response = await commentAPI.toggleLike(commentId);
      
      if (currentComment?._id === commentId) {
        setCurrentComment(response.data);
      }
      
      setComments(prev =>
        prev.map(c => c._id === commentId ? response.data : c)
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al dar like');
      return { success: false, error: err };
    }
  };

  // Toggle pin (solo moderadores)
  const togglePin = async (commentId) => {
    try {
      setError(null);
      const response = await commentAPI.togglePin(commentId);
      
      if (currentComment?._id === commentId) {
        setCurrentComment(response.data);
      }
      
      setComments(prev =>
        prev.map(c => c._id === commentId ? response.data : c)
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al fijar comentario');
      return { success: false, error: err };
    }
  };

  // Subir archivo
  const uploadFile = async (file, relatedModel, relatedId) => {
    try {
      setError(null);
      const response = await fileAPI.upload(file, relatedModel, relatedId);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Error al subir archivo');
      return { success: false, error: err };
    }
  };

  const value = {
    comments,
    currentComment,
    loading,
    error,
    pagination,
    fetchComments,
    fetchCommentById,
    createComment,
    updateComment,
    deleteComment,
    addReply,
    toggleLike,
    togglePin,
    uploadFile,
  };

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
};
