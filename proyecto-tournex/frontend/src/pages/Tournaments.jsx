import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, Users, Trash2 } from 'lucide-react';
import { tournamentsAPI } from '../api/api';
import { getSocket } from '../utils/socket';
import Spinner from '../components/ui/Spinner';
import { getStatusLabel, getStatusClass } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export default function Tournaments() {
  const { user } = useAuth();
  const toast = useToast();
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
      const response = await tournamentsAPI.getAll();
      const data = response.data.data || response.data;
      setTournaments(data.tournaments || data || []);
    } catch (err) {
      console.error('Error loading tournaments:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar torneos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId, tournamentName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el torneo "${tournamentName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await tournamentsAPI.delete(tournamentId);
      setTournaments(prev => prev.filter(t => t._id !== tournamentId));
      toast.success('Torneo eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting tournament:', err);
      toast.error(`Error al eliminar torneo: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredTournaments = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner text="Cargando torneos..." size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-3">Todos los Torneos</h2>
              <p className="text-lg text-muted-foreground">Encuentra y únete a torneos emocionantes</p>
            </div>
            <Link to="/tournaments/create">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2 transition-colors whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Crear Torneo
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar torneos por nombre o juego..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 bg-card/50 border-border rounded-xl hover:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl mb-8 p-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Tournaments Grid */}
        <div className="space-y-4">
          {filteredTournaments.map((tournament) => {
            const currentPlayers = tournament.currentParticipants || 0;

            return (
              <div
                key={tournament._id}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-foreground">{tournament.name}</h3>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusClass(tournament.status)}`}
                      >
                        {getStatusLabel(tournament.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Organizador: {tournament.owner?.username || tournament.createdBy?.username || 'Organizador'}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-base text-foreground font-medium">{tournament.game}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {currentPlayers} / {tournament.maxParticipants} jugadores
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/tournaments/${tournament._id}`}>
                      <Button className="bg-primary hover:bg-primary/90 transition-colors whitespace-nowrap">
                        Ver Detalles
                      </Button>
                    </Link>
                    {user?.role === 'super_admin' && (
                      <Button
                        onClick={() => handleDeleteTournament(tournament._id, tournament.name)}
                        className="bg-destructive hover:bg-destructive/90 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTournaments.length === 0 && !loading && (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl text-center py-16">
            <p className="text-muted-foreground mb-4">No se encontraron torneos</p>
            <Button variant="outline" onClick={() => setSearchTerm('')} className="hover:border-primary transition-colors">
              Limpiar búsqueda
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
