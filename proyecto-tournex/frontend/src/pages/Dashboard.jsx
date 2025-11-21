import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Gamepad2, Trophy, Users, Plus, LogOut, Settings } from 'lucide-react';
import { tournamentsAPI } from '../api/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await tournamentsAPI.getAll();
      const data = response.data.data || response.data;
      const allTournaments = data.tournaments || data || [];
      
      setTournaments(allTournaments.slice(0, 3)); // Mostrar últimos 3 torneos
      
      // Filtrar torneos donde el usuario está inscrito o es owner
      const userTournaments = allTournaments.filter(t => 
        t.owner?._id === user?._id || 
        t.participants?.some(p => p.player?._id === user?._id)
      );
      setMyTournaments(userTournaments);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'Próximamente',
      registration_open: 'Inscripciones Abiertas',
      registration_closed: 'Inscripciones Cerradas',
      in_progress: 'En Progreso',
      completed: 'Finalizado',
      cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      pending: 'bg-secondary/20 text-secondary',
      registration_open: 'bg-accent/20 text-accent',
      registration_closed: 'bg-yellow-500/20 text-yellow-500',
      in_progress: 'bg-accent/20 text-accent',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/20 text-destructive'
    };
    return classMap[status] || 'bg-muted text-muted-foreground';
  };

  const activeTournaments = myTournaments.filter(t => 
    t.status === 'in_progress' || t.status === 'registration_open'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Tournament Hub</h1>
          </Link>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground capitalize">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Jugador'}
            </span>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center text-primary font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1">
                  <button 
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent/10 flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false);
                      // TODO: Navigate to settings
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent/10 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bienvenido, {user?.username || 'Jugador'}
          </h2>
          <p className="text-muted-foreground">Gestiona tus torneos y equipos desde aquí</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-primary" />
                Torneos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{activeTournaments.length}</p>
              <p className="text-sm text-muted-foreground">participando</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-accent" />
                Mis Equipos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">0</p>
              <p className="text-sm text-muted-foreground">equipos activos</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gamepad2 className="w-5 h-5 text-secondary" />
                Partidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">0</p>
              <p className="text-sm text-muted-foreground">próximas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Torneos</h3>
            <Link to="/tournaments/create">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Torneo
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-1 gap-4">
            {tournaments.map((tournament) => (
              <Card key={tournament._id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{tournament.name}</CardTitle>
                      <CardDescription>{tournament.game}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(tournament.status)}`}>
                      {getStatusLabel(tournament.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {tournament.currentParticipants || 0} / {tournament.maxParticipants} jugadores
                    </div>
                    <Link to={`/tournaments/${tournament._id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Browse All Tournaments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Explorar Más Torneos</CardTitle>
            <CardDescription>Descubre nuevos torneos en los que puedas participar</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/tournaments">
              <Button className="bg-primary hover:bg-primary/90">Ver Todos los Torneos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
