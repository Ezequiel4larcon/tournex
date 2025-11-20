import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            TOURNEX
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-primary-200 transition">
              Inicio
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/new-post" className="hover:text-primary-200 transition">
                  Nuevo Post
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm">
                    {user?.username}
                    {user?.role !== 'user' && (
                      <span className="ml-2 text-xs bg-primary-500 px-2 py-1 rounded">
                        {user?.role}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-700 hover:bg-gray-100 px-4 py-2 rounded transition"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
