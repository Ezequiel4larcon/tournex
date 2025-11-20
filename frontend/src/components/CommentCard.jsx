import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useComments } from '../hooks/useComments';

const CommentCard = ({ comment }) => {
  const { user, isAuthenticated } = useAuth();
  const { toggleLike, togglePin, deleteComment } = useComments();

  const isOwner = user?._id === comment.author._id;
  const hasLiked = comment.likes?.includes(user?._id);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    await toggleLike(comment._id);
  };

  const handlePin = async (e) => {
    e.preventDefault();
    await togglePin(comment._id);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm('¿Estás seguro de eliminar este comentario?')) {
      const result = await deleteComment(comment._id);
      if (result.success) {
        alert('Comentario eliminado exitosamente');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <Link to={`/comment/${comment._id}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {comment.isPinned && (
                <span className="text-primary-600 mr-2">📌</span>
              )}
              {comment.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Por {comment.author.username}</span>
              <span>•</span>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                {comment.category}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {comment.content}
        </p>

        {comment.tags && comment.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {comment.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-4 text-sm text-gray-600">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-primary-600 transition ${
              hasLiked ? 'text-primary-600 font-semibold' : ''
            }`}
            disabled={!isAuthenticated}
          >
            <span>{hasLiked ? '❤️' : '🤍'}</span>
            <span>{comment.likes?.length || 0}</span>
          </button>
          <span className="flex items-center gap-1">
            💬 {comment.replies?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            👁️ {comment.views || 0}
          </span>
        </div>

        <div className="flex gap-2">
          {(isOwner || user?.role === 'moderator' || user?.role === 'admin') && (
            <>
              {(user?.role === 'moderator' || user?.role === 'admin') && (
                <button
                  onClick={handlePin}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {comment.isPinned ? 'Desfijar' : 'Fijar'}
                </button>
              )}
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
