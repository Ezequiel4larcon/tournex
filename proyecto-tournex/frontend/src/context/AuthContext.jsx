import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';
import { initSocket, disconnectSocket, getSocket } from '../utils/socket';

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
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Inicializar Socket.IO al recuperar sesión
          if (!getSocket()) {
            initSocket(token);
          }
          
          // Opcionalmente, verificar el token con el backend
          try {
            const response = await authAPI.getProfile();
            const userData = response.data.data || response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (profileErr) {
            // Si falla la verificación del perfil, mantener el usuario del localStorage
            // Solo hacer logout si es un error 401 (token realmente inválido)
            if (profileErr.response?.status === 401) {
              console.error('Token inválido, cerrando sesión');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            } else {
              // Otros errores (red, servidor) - mantener sesión local
              console.warn('No se pudo verificar perfil, usando datos locales:', profileErr.message);
            }
          }
        } catch (err) {
          console.error('Error al parsear usuario:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
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
      const { token, user: newUser } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al registrar usuario';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          message: errorMessage,
          errors: err.response?.data?.errors || []
        }
      };
    }
  };

  // Iniciar sesión
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, user: loggedUser } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      // Inicializar Socket.IO
      initSocket(token);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          message: errorMessage,
          errors: err.response?.data?.errors || []
        }
      };
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
    isPlayer: user?.role === 'player',
    isSuperAdmin: user?.role === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
