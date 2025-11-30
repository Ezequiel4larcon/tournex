import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Gamepad2, Trophy, Users, Plus, LogOut, Settings, Shield, Grid3x3, Swords } from 'lucide-react';
import { tournamentsAPI, matchesAPI } from '../api/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [moderatedTournaments, setModeratedTournaments] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('playing'); // 'playing' or 'moderating'

  useEffect(() => {
    // Solo cargar datos cuando el usuario esté disponible
    if (user) {
      loadDashboardData();
    }
  }, [user]); // Agregar user como dependencia

  const loadDashboardData = async () => {
    // Verificar que el usuario esté cargado
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await tournamentsAPI.getAll();
      const data = response.data.data || response.data;
      const allTournaments = data.tournaments || data || [];
      
      console.log('Usuario actual:', user);
      console.log('Todos los torneos:', allTournaments);
      
      setTournaments(allTournaments.slice(0, 3)); // Mostrar últimos 3 torneos
      
      const userId = user._id;
      
      // Filtrar torneos donde el usuario es owner/moderador
      const moderated = allTournaments.filter(t => {
        const ownerId = t.owner?._id || t.owner;
        const isOwner = ownerId && userId && ownerId === userId;
        console.log(`Torneo ${t.name}: owner=${ownerId}, userId=${userId}, isOwner=${isOwner}`);
        return isOwner;
      });
      console.log('Torneos moderados:', moderated);
      setModeratedTournaments(moderated);
      
      // Filtrar torneos donde el usuario está inscrito como participante (no owner)
      const participating = allTournaments.filter(t => {
        const ownerId = t.owner?._id || t.owner;
        const isNotOwner = !ownerId || !userId || ownerId !== userId;
        const isParticipant = t.participants?.some(p => {
          const playerId = p.player?._id || p.player;
          return playerId === userId;
        });
        console.log(`Torneo ${t.name}: isParticipant=${isParticipant}, participants=`, t.participants);
        return isNotOwner && isParticipant;
      });
      console.log('Torneos participando:', participating);
      setMyTournaments(participating);

      // Cargar partidos del usuario
      await loadMyMatches(participating);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyMatches = async (participatingTournaments) => {
    try {
      const userId = user?._id;
      if (!userId) return;

      // Obtener todos los partidos de los torneos donde participa
      const allMatches = [];
      for (const tournament of participatingTournaments) {
        try {
          const response = await tournamentsAPI.getMatches(tournament._id);
          const matches = response.data.data || response.data || [];
          
          // Filtrar partidos donde el usuario es participante
          const userMatches = matches.filter(match => {
            const p1Id = match.participant1?.player?._id || match.participant1?.player;
            const p2Id = match.participant2?.player?._id || match.participant2?.player;
            return (p1Id === userId || p2Id === userId) && match.status !== 'completed';
          });

          // Agregar información del torneo a cada match
          userMatches.forEach(match => {
            match.tournamentInfo = {
              _id: tournament._id,
              name: tournament.name,
              game: tournament.game
            };
          });

          allMatches.push(...userMatches);
        } catch (err) {
          console.error(`Error loading matches for tournament ${tournament._id}:`, err);
        }
      }

      setMyMatches(allMatches);
    } catch (err) {
      console.error('Error loading matches:', err);
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Welcome Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-3">
            Bienvenido, {user?.username || 'Jugador'}
          </h2>
          <p className="text-lg text-muted-foreground">Gestiona tus torneos y partidas desde aquí</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Participando</h3>
            </div>
            <p className="text-4xl font-bold text-primary mb-2">{activeTournaments.length}</p>
            <p className="text-sm text-muted-foreground">torneos activos</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Moderando</h3>
            </div>
            <p className="text-4xl font-bold text-accent mb-2">{activeModerated.length}</p>
            <p className="text-sm text-muted-foreground">torneos creados</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors">
                <Gamepad2 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Partidas</h3>
            </div>
            <p className="text-4xl font-bold text-foreground mb-2">{myMatches.length}</p>
            <p className="text-sm text-muted-foreground">pendientes</p>
          </div>
        </div>

        {/* My Matches Section */}
        {myMatches.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Swords className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">Mis Partidos Pendientes</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myMatches.map((match) => {
                const isParticipant1 = (match.participant1?.player?._id || match.participant1?.player) === user?._id;
                const opponent = isParticipant1 ? match.participant2 : match.participant1;
                const opponentName = opponent?.player?.username || opponent?.team?.name || 'TBD';

                return (
                  <div key={match._id} className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-accent transition-all duration-300">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">{match.tournamentInfo?.name}</h4>
                      <p className="text-xs text-muted-foreground">Ronda {match.round} - Match #{match.matchNumber}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{user?.username?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold">Tú</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">VS</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">{opponentName}</span>
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-accent">{opponentName.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                          match.status === 'pending' 
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                            : 'bg-accent/10 text-accent border border-accent/20'
                        }`}>
                          {match.status === 'pending' ? 'Pendiente' : 'En Progreso'}
                        </span>
                        <Link to={`/tournaments/${match.tournamentInfo?._id}/bracket`}>
                          <Button variant="outline" size="sm" className="text-xs hover:border-primary transition-colors">
                            Ver Bracket
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tournaments Section with Tabs */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-3xl font-bold text-foreground">Mis Torneos</h3>
            <Link to="/tournaments/create">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                Nuevo Torneo
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('playing')}
              className={`px-4 py-3 font-medium transition-all duration-200 ${
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
          <div className="space-y-4">
            {activeTab === 'playing' && myTournaments.length === 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-12 text-center">
                <p className="text-muted-foreground mb-4">No estás participando en ningún torneo</p>
                <Link to="/tournaments">
                  <Button variant="outline" className="hover:border-primary transition-colors">Explorar Torneos</Button>
                </Link>
              </div>
            )}
            
            {activeTab === 'moderating' && moderatedTournaments.length === 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-12 text-center">
                <p className="text-muted-foreground mb-4">No has creado ningún torneo</p>
                <Link to="/tournaments/create">
                  <Button variant="outline" className="hover:border-primary transition-colors">Crear Torneo</Button>
                </Link>
              </div>
            )}

            {activeTab === 'playing' && myTournaments.map((tournament) => (
              <div key={tournament._id} className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h4 className="text-xl font-semibold text-foreground">{tournament.name}</h4>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusClass(tournament.status)}`}>
                        {getStatusLabel(tournament.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tournament.game}</p>
                    <p className="text-sm text-muted-foreground">
                      {tournament.currentParticipants || 0} / {tournament.maxParticipants} jugadores
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {tournament.status === 'in_progress' && (
                      <Link to={`/tournaments/${tournament._id}/bracket`}>
                        <Button className="bg-accent hover:bg-accent/90 flex items-center gap-2 transition-colors" size="sm">
                          <Grid3x3 className="w-4 h-4" />
                          Bracket
                        </Button>
                      </Link>
                    )}
                    <Link to={`/tournaments/${tournament._id}`}>
                      <Button variant="outline" size="sm" className="hover:border-primary transition-colors">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'moderating' && moderatedTournaments.map((tournament) => (
              <div key={tournament._id} className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-accent transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h4 className="text-xl font-semibold text-foreground">{tournament.name}</h4>
                      <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-lg border border-accent/20 whitespace-nowrap">Organizador</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusClass(tournament.status)}`}>
                        {getStatusLabel(tournament.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tournament.game}</p>
                    <p className="text-sm text-muted-foreground">
                      {tournament.currentParticipants || 0} / {tournament.maxParticipants} jugadores
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {tournament.status === 'in_progress' && (
                      <Link to={`/tournaments/${tournament._id}/bracket`}>
                        <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2 transition-colors" size="sm">
                          <Grid3x3 className="w-4 h-4" />
                          Bracket
                        </Button>
                      </Link>
                    )}
                    <Link to={`/tournaments/${tournament._id}`}>
                      <Button className="bg-accent hover:bg-accent/90 transition-colors" size="sm">
                        {tournament.status === 'completed' ? 'Ver Detalles' : 'Moderar'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browse All Tournaments */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 hover:border-primary transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Explorar Más Torneos</h3>
              <p className="text-muted-foreground">Descubre nuevos torneos en los que puedas participar</p>
            </div>
            <Link to="/tournaments">
              <Button className="bg-primary hover:bg-primary/90 transition-colors whitespace-nowrap">Ver Todos los Torneos</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
