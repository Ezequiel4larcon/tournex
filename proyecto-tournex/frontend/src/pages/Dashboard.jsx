import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Gamepad2, Trophy, Users, Plus, LogOut, Settings, Shield } from 'lucide-react';
import { tournamentsAPI } from '../api/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [moderatedTournaments, setModeratedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('playing'); // 'playing' or 'moderating'

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
      
      const userId = user?._id;
      
      // Filtrar torneos donde el usuario es owner/moderador
      const moderated = allTournaments.filter(t => {
        const ownerId = t.owner?._id || t.owner;
        return ownerId && userId && ownerId === userId;
      });
      setModeratedTournaments(moderated);
      
      // Filtrar torneos donde el usuario está inscrito como participante (no owner)
      const participating = allTournaments.filter(t => {
        const ownerId = t.owner?._id || t.owner;
        const isNotOwner = !ownerId || !userId || ownerId !== userId;
        const isParticipant = t.participants?.some(p => p.player?._id === userId);
        return isNotOwner && isParticipant;
      });
      setMyTournaments(participating);
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
  
  const activeModerated = moderatedTournaments.filter(t =>
    t.status === 'in_progress' || t.status === 'registration_open' || t.status === 'pending'
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
            <h1 className="text-2xl font-bold text-foreground">TourneX</h1>
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
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-primary" />
                Participando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{activeTournaments.length}</p>
              <p className="text-sm text-muted-foreground">torneos activos</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-accent" />
                Moderando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{activeModerated.length}</p>
              <p className="text-sm text-muted-foreground">torneos creados</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-secondary" />
                Mis Equipos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">0</p>
              <p className="text-sm text-muted-foreground">equipos activos</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gamepad2 className="w-5 h-5 text-muted-foreground" />
                Partidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">0</p>
              <p className="text-sm text-muted-foreground">próximas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments Section with Tabs */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Mis Torneos</h3>
            <Link to="/tournaments/create">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Torneo
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab('playing')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'playing'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Participando ({myTournaments.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('moderating')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'moderating'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Moderando ({moderatedTournaments.length})
              </div>
            </button>
          </div>

          {/* Tournament Lists */}
          <div className="grid md:grid-cols-1 gap-4">
            {activeTab === 'playing' && myTournaments.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No estás participando en ningún torneo</p>
                  <Link to="/tournaments">
                    <Button variant="outline">Explorar Torneos</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            
            {activeTab === 'moderating' && moderatedTournaments.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No has creado ningún torneo</p>
                  <Link to="/tournaments/create">
                    <Button variant="outline">Crear Torneo</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {activeTab === 'playing' && myTournaments.map((tournament) => (
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

            {activeTab === 'moderating' && moderatedTournaments.map((tournament) => (
              <Card key={tournament._id} className="bg-card border-border hover:border-accent/30 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{tournament.name}</CardTitle>
                        <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Organizador</span>
                      </div>
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
                      <Button className="bg-accent hover:bg-accent/90" size="sm">
                        Moderar
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
