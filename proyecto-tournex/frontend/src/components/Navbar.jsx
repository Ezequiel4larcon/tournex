import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NotificationsPanel } from './NotificationsPanel';
import { Bell } from 'lucide-react';
import { notificationsAPI } from '../api/api';
import { getSocket } from '../utils/socket';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      const socket = getSocket();
      if (socket) {
        socket.on('new_notification', () => {
          setUnreadCount((prev) => prev + 1);
        });

        return () => {
          socket.off('new_notification');
        };
      }
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold">
              TOURNEX
            </Link>

            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-blue-200 transition">
                Inicio
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/tournaments" className="hover:text-blue-200 transition">
                    Torneos
                  </Link>
                  <Link to="/teams" className="hover:text-blue-200 transition">
                    Equipos
                  </Link>
                  <Link to="/new-post" className="hover:text-blue-200 transition">
                    Foro
                  </Link>
                  
                  <div className="flex items-center gap-4">
                    {/* Bell Icon for Notifications */}
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative hover:text-blue-200 transition"
                    >
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <span className="text-sm">
                      {user?.username}
                      {user?.role && user.role !== 'player' && (
                        <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">
                          {user?.role}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded transition"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-4">
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded transition"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-blue-700 hover:bg-gray-100 px-4 py-2 rounded transition"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Navbar;
