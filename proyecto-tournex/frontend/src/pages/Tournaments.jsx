import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Gamepad2, Plus, Search, Users } from 'lucide-react';
import { tournamentsAPI } from '../api/api';
import { getSocket } from '../utils/socket';

export default function Tournaments() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTournaments();

    // Socket.IO - escuchar actualizaciones en tiempo real
    const socket = getSocket();
    if (socket) {
      socket.on('tournament_updated', (updatedTournament) => {
        setTournaments((prev) =>
          prev.map((t) => (t._id === updatedTournament._id ? updatedTournament : t))
        );
      });

      socket.on('tournament_created', (newTournament) => {
        setTournaments((prev) => [newTournament, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('tournament_updated');
        socket.off('tournament_created');
      }
    };
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentsAPI.getAll();
      setTournaments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando torneos...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">TourneX</h1>
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground">
                Bienvenido, {user.username}
              </span>
            )}
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Todos los Torneos</h2>
              <p className="text-muted-foreground">Encuentra y únete a torneos emocionantes</p>
            </div>
            <Link to="/tournaments/create">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Crear Torneo
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar torneos por nombre o juego..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/30 mb-8">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tournaments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4">
          {filteredTournaments.map((tournament) => {
            const statusBadge = getStatusBadge(tournament.status);
            const currentPlayers = tournament.participants?.length || 0;
            const isFull = currentPlayers >= tournament.maxPlayers;

            return (
              <Card
                key={tournament._id}
                className="bg-card border-border hover:border-primary/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{tournament.name}</CardTitle>
                      <CardDescription>
                        {tournament.createdBy?.username || 'Organizador'}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${statusBadge.class}`}
                    >
                      {statusBadge.text}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <p className="text-sm text-foreground font-medium">{tournament.game}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {currentPlayers} / {tournament.maxPlayers} jugadores
                      </div>
                    </div>
                    <Link to={`/tournaments/${tournament._id}`}>
                      <Button className="bg-primary hover:bg-primary/90">
                        {isFull ? 'Ver' : 'Inscribirse'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTournaments.length === 0 && !loading && (
          <Card className="bg-card border-border text-center py-12">
            <p className="text-muted-foreground mb-4">No se encontraron torneos</p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Limpiar búsqueda
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
