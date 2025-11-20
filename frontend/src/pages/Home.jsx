import { useState, useEffect } from 'react';
import { useComments } from '../hooks/useComments';
import { CATEGORIES } from '../utils/constants';
import CommentCard from '../components/CommentCard';

const Home = () => {
  const { comments, loading, error, pagination, fetchComments } = useComments();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'createdAt',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchComments(filters);
  }, [filters, fetchComments]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset a la primera página al cambiar filtros
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Foro TOURNEX</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar en títulos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="createdAt">Más reciente</option>
              <option value="-createdAt">Más antiguo</option>
              <option value="-likes">Más likes</option>
              <option value="-views">Más vistas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Cargando comentarios...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Lista de comentarios */}
      {!loading && !error && (
        <>
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No hay comentarios disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <CommentCard key={comment._id} comment={comment} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-700 transition"
              >
                Anterior
              </button>
              
              <span className="text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-700 transition"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
