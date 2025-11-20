import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/forumApi';
import { initSocket, disconnectSocket } from '../utils/socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Opcionalmente, verificar el token con el backend
          const response = await authAPI.getProfile();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Error al cargar usuario:', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Registrar usuario
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
      return { success: false, error: err };
    }
  };

  // Iniciar sesión
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, user: loggedUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      // Inicializar Socket.IO
      initSocket(token);
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      return { success: false, error: err };
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      // Desconectar Socket.IO
      disconnectSocket();
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Actualizar perfil
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, data: updatedUser };
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
      return { success: false, error: err };
    }
  };

  // Cambiar contraseña
  const changePassword = async (passwords) => {
    try {
      setError(null);
      await authAPI.changePassword(passwords);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
      return { success: false, error: err };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    // Roles del sistema de foros (legacy)
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    // Roles del sistema de torneos
    isPlayer: user?.role === 'player',
    isReferee: user?.role === 'referee',
    isTournamentAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
