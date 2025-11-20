import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';

const CommentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentComment, loading, error, fetchCommentById, addReply, toggleLike, deleteComment } = useComments();
  const { user, isAuthenticated } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    fetchCommentById(id);
  }, [id, fetchCommentById]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dar like');
      return;
    }
    await toggleLike(id);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      alert('La respuesta no puede estar vacía');
      return;
    }

    const result = await addReply(id, { content: replyContent });
    
    if (result.success) {
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este comentario?')) {
      const result = await deleteComment(id);
      if (result.success) {
        navigate('/');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-lg">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!currentComment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-lg">Comentario no encontrado</div>
      </div>
    );
  }

  const isOwner = user?._id === currentComment.author._id;
  const hasLiked = currentComment.likes?.includes(user?._id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Post principal */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentComment.isPinned && (
                <span className="text-primary-600 mr-2">📌</span>
              )}
              {currentComment.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Por {currentComment.author.username}</span>
              <span>•</span>
              <span>{new Date(currentComment.createdAt).toLocaleDateString()}</span>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                {currentComment.category}
              </span>
            </div>
          </div>
          
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              Eliminar
            </button>
          )}
        </div>

        <div className="prose max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{currentComment.content}</p>
        </div>

        {currentComment.tags && currentComment.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {currentComment.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 ${
              hasLiked ? 'text-primary-600' : 'text-gray-600'
            } hover:text-primary-700 transition`}
            disabled={!isAuthenticated}
          >
            <span>{hasLiked ? '❤️' : '🤍'}</span>
            <span>{currentComment.likes?.length || 0} likes</span>
          </button>
          
          <span className="flex items-center gap-2 text-gray-600">
            💬 {currentComment.replies?.length || 0} respuestas
          </span>
          
          <span className="flex items-center gap-2 text-gray-600">
            👁️ {currentComment.views || 0} vistas
          </span>
        </div>
      </div>

      {/* Respuestas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Respuestas ({currentComment.replies?.length || 0})
          </h2>
          
          {isAuthenticated && !showReplyForm && (
            <button
              onClick={() => setShowReplyForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Responder
            </button>
          )}
        </div>

        {/* Formulario de respuesta */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mb-6">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Escribe tu respuesta..."
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Publicar Respuesta
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de respuestas */}
        {currentComment.replies && currentComment.replies.length > 0 ? (
          <div className="space-y-4">
            {currentComment.replies.map((reply, index) => (
              <div key={index} className="border-l-4 border-primary-200 pl-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="font-semibold">{reply.author.username}</span>
                  <span>•</span>
                  <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{reply.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No hay respuestas aún. ¡Sé el primero en responder!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentDetail;
