import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NotificationsPanel } from './NotificationsPanel';
import { Bell, Gamepad2, User } from 'lucide-react';
import { notificationsAPI } from '../api/api';
import { getSocket } from '../utils/socket';
import { Button } from './ui/Button';

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
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">TourneX</h1>
            </Link>

            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition">
                Inicio
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition">
                    Dashboard
                  </Link>
                  <Link to="/tournaments" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition">
                    Torneos
                  </Link>
                  
                  <div className="flex items-center gap-3 sm:gap-4 border-l border-border pl-4 sm:pl-6">
                    {/* Bell Icon for Notifications */}
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative text-muted-foreground hover:text-foreground transition"
                    >
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{user?.username}</span>
                      {user?.role && user.role !== 'player' && (
                        <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          {user?.role === 'super_admin' ? 'Admin' : user?.role}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                    >
                      Salir
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2 sm:gap-4">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-sm">
                      Registrarse
                    </Button>
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
