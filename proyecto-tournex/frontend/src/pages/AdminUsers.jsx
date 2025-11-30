import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Users, Shield, Search, UserX, UserCheck, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Verificar que sea super_admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Cargar estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 20,
          ...(search && { search }),
          ...(roleFilter && { role: roleFilter })
        };
        const response = await api.get('/users', { params });
        setUsers(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, search, roleFilter]);

  // Banear/Desbanear usuario
  const handleToggleStatus = async (userId) => {
    if (window.confirm('¿Estás seguro de cambiar el estado de este usuario?')) {
      try {
        await api.patch(`/users/${userId}/toggle-status`);
        // Actualizar lista de usuarios
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u._id === userId ? { ...u, isActive: !u.isActive } : u
          )
        );
      } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Error al cambiar estado del usuario');
      }
    }
  };

  // Cambiar rol de usuario
  const handleChangeRole = async (userId, newRole) => {
    if (window.confirm(`¿Cambiar rol a ${newRole}?`)) {
      try {
        await api.put(`/users/${userId}/role`, { role: newRole });
        // Actualizar lista de usuarios
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u._id === userId ? { ...u, role: newRole } : u
          )
        );
      } catch (error) {
        console.error('Error changing role:', error);
        alert('Error al cambiar rol del usuario');
      }
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/users/${userId}`);
        // Remover de la lista
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Panel de Administración</h1>
          </div>
          <p className="text-lg text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.byStatus.active}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  Suspendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.byStatus.suspended}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Registros (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.recentRegistrations}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Buscar por username o email
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar usuarios..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Filtrar por rol
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="">Todos los roles</option>
                  <option value="player">Player</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de usuarios */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Último acceso
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr 
                      key={u._id} 
                      className={`hover:bg-muted/50 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full ring-2 ring-border"
                              src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                              alt={u.username}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          disabled={u._id === user._id}
                          className="text-sm bg-card border border-border rounded px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="player">Player</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.isActive 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {u.isActive ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString('es-ES') : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleToggleStatus(u._id)}
                            disabled={u._id === user._id}
                            variant={u.isActive ? 'outline' : 'default'}
                            size="sm"
                            className={u.isActive ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10' : 'bg-green-500 hover:bg-green-600'}
                          >
                            {u.isActive ? 'Suspender' : 'Activar'}
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u._id === user._id}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Anterior
            </Button>
            <span className="text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
