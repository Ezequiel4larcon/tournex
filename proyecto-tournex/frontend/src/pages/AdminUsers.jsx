import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users, Shield, Search, UserX, UserCheck, Trash2 } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import StatsCard from '../components/ui/StatsCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';

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
  const toast = useToast();

  // Estado del diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, variant: 'default' });

  const openConfirm = (config) => setConfirmDialog({ isOpen: true, ...config });
  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

  // Verificar que sea super_admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') navigate('/dashboard');
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
        const params = { page, limit: 20, ...(search && { search }), ...(roleFilter && { role: roleFilter }) };
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
  const handleToggleStatus = (userId) => {
    openConfirm({
      title: 'Cambiar estado de usuario',
      message: '¿Estás seguro de cambiar el estado de este usuario?',
      variant: 'default',
      onConfirm: async () => {
        try {
          await api.patch(`/users/${userId}/toggle-status`);
          setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
          toast.success('Estado del usuario actualizado');
          closeConfirm();
        } catch (error) {
          console.error('Error toggling user status:', error);
          toast.error('Error al cambiar estado del usuario');
        }
      }
    });
  };

  // Cambiar rol de usuario
  const handleChangeRole = (userId, newRole) => {
    openConfirm({
      title: 'Cambiar rol',
      message: `¿Cambiar rol a ${newRole}?`,
      variant: 'default',
      onConfirm: async () => {
        try {
          await api.put(`/users/${userId}/role`, { role: newRole });
          setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
          toast.success('Rol actualizado exitosamente');
          closeConfirm();
        } catch (error) {
          console.error('Error changing role:', error);
          toast.error('Error al cambiar rol del usuario');
        }
      }
    });
  };

  // Eliminar usuario
  const handleDeleteUser = (userId) => {
    openConfirm({
      title: 'Eliminar usuario',
      message: '¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${userId}`);
          setUsers(prev => prev.filter(u => u._id !== userId));
          toast.success('Usuario eliminado exitosamente');
          closeConfirm();
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Error al eliminar usuario');
        }
      }
    });
  };

  if (!user || user.role !== 'super_admin') return null;

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Spinner text="Cargando usuarios..." size="lg" /></div>;
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
            <StatsCard icon={Users} label="Total Usuarios" value={stats.total} colorClass="text-primary" hoverBorderClass="hover:border-primary" />
            <StatsCard icon={UserCheck} label="Activos" value={stats.byStatus.active} colorClass="text-accent" hoverBorderClass="hover:border-accent" />
            <StatsCard icon={UserX} label="Suspendidos" value={stats.byStatus.suspended} colorClass="text-destructive" hoverBorderClass="hover:border-destructive" />
            <StatsCard icon={Shield} label="Registros (30d)" value={stats.recentRegistrations} colorClass="text-secondary" hoverBorderClass="hover:border-secondary" />
          </div>
        )}

        {/* Filtros */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 mb-6 hover:border-primary transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar por username o email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Buscar usuarios..."
                  className="pl-12 h-12 bg-card/50 border-border rounded-xl hover:border-primary transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Filtrar por rol</label>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="w-full h-12 px-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary transition-colors text-foreground"
              >
                <option value="">Todos los roles</option>
                <option value="player">Player</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Último acceso</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className={`hover:bg-muted/30 transition-all duration-200 ${!u.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full ring-2 ring-primary/20"
                          src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                          alt={u.username}
                        />
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
                        className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-foreground focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary transition-colors"
                      >
                        <option value="player">Player</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg ${
                        u.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
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
                          size="sm"
                          className={u.isActive
                            ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors'
                            : 'bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30 transition-colors'}
                        >
                          {u.isActive ? 'Suspender' : 'Activar'}
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u._id === user._id}
                          size="sm"
                          className="bg-destructive hover:bg-destructive/90 transition-colors"
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
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" className="hover:border-primary transition-colors">
              Anterior
            </Button>
            <span className="text-muted-foreground font-medium">Página {page} de {totalPages}</span>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline" className="hover:border-primary transition-colors">
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </main>
  );
}
