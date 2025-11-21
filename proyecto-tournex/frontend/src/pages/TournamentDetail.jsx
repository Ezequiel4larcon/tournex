import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Gamepad2, ArrowLeft, Users, Trophy, Calendar, Zap, CheckCircle2, Settings, Play, Grid3x3 } from 'lucide-react';
import { tournamentsAPI } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { getSocket, joinTournament } from '../utils/socket';

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadTournament();

    // Socket.IO - unirse a la sala del torneo y escuchar actualizaciones
    const socket = getSocket();
    if (socket && id) {
      joinTournament(id);

      socket.on('tournament_updated', (updatedTournament) => {
        if (updatedTournament._id === id) {
          setTournament(updatedTournament);
        }
      });

      socket.on('participant_joined', ({ tournamentId, participant }) => {
        if (tournamentId === id) {
          setParticipants((prev) => [...prev, participant]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('tournament_updated');
        socket.off('participant_joined');
      }
    };
  }, [id]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      const response = await tournamentsAPI.getById(id);
      const data = response.data.data || response.data;
      setTournament(data);
      
      // Verificar si el usuario está inscrito (solo jugadores individuales ahora)
      const enrolled = data.participants?.some((p) => p.player?._id === user?._id);
      setIsEnrolled(enrolled);
      
      // Cargar participantes
      setParticipants(data.participants || []);
    } catch (err) {
      console.error('Error loading tournament:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await tournamentsAPI.register(id, {});
      alert('¡Te has inscrito exitosamente en el torneo!');
      loadTournament();
    } catch (err) {
      alert(`Error al inscribirse: ${err.response?.data?.message || err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleGenerateBracket = async () => {
    try {
      await tournamentsAPI.generateBracket(id);
      alert('Bracket generado exitosamente. Árbitros asignados');
      loadTournament();
    } catch (err) {
      alert(`Error al generar bracket: ${err.message}`);
    }
  };

  const handleStartTournament = async () => {
    try {
      await tournamentsAPI.start(id);
      alert('Torneo iniciado');
      loadTournament();
    } catch (err) {
      alert(`Error al iniciar torneo: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { class: 'bg-accent/20 text-accent', text: 'En Progreso' },
      upcoming: { class: 'bg-secondary/20 text-secondary', text: 'Próximamente' },
      completed: { class: 'bg-muted text-muted-foreground', text: 'Finalizado' },
    };
    return statusMap[status] || statusMap.upcoming;
  };

  const getFormatLabel = (format) => {
    const formats = {
      elimination: 'Eliminación Simple',
      double_elimination: 'Doble Eliminación',
      round_robin: 'Round Robin',
    };
    return formats[format] || format;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando torneo...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Torneo no encontrado'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBadge = getStatusBadge(tournament.status);
  const isOwner = tournament.owner?._id === user?._id || tournament.owner === user?._id;
  const isSuperAdmin = user?.role === 'super_admin';
  const canModerate = isOwner || isSuperAdmin;
  const currentPlayers = participants.length;
  const isFull = currentPlayers >= tournament.maxParticipants;

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">TourneX</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/tournaments"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a torneos
        </Link>

        {/* Tournament Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  {tournament.name}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {tournament.description}
                </CardDescription>
              </div>
              <span className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Tournament Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Juego</p>
                <p className="text-sm font-medium text-foreground">{tournament.game}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Formato</p>
                <p className="text-sm font-medium text-foreground">
                  {getFormatLabel(tournament.format)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Organizador</p>
                <p className="text-sm font-medium text-foreground">
                  {tournament.owner?.username || tournament.createdBy?.username || 'Usuario'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Inicio</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(tournament.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Fin</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(tournament.endDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Jugadores</p>
                <p className="text-sm font-medium text-foreground">
                  {currentPlayers} / {tournament.maxParticipants}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moderator Controls */}
        {canModerate && (
          <Card className="bg-primary/10 border-primary/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Panel de Moderación
                {isOwner && <span className="text-xs bg-primary/20 px-2 py-1 rounded">Organizador</span>}
              </CardTitle>
              <CardDescription>
                Controla y administra tu torneo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {tournament.status === 'pending' && (
                  <Button 
                    onClick={() => {/* TODO: Abrir inscripciones */}} 
                    className="bg-accent hover:bg-accent/90 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Abrir Inscripciones
                  </Button>
                )}
                
                {tournament.status === 'registration_open' && currentPlayers >= 2 && (
                  <>
                    <Button 
                      onClick={handleGenerateBracket} 
                      className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                    >
                      <Grid3x3 className="w-4 h-4" />
                      Generar Bracket
                    </Button>
                    <Button 
                      onClick={handleStartTournament} 
                      className="bg-accent hover:bg-accent/90 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Torneo
                    </Button>
                  </>
                )}
                
                {tournament.status === 'in_progress' && (
                  <Button 
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    Ver Partidas
                  </Button>
                )}
              </div>
              
              <div className="mt-4 p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Estado:</strong> {tournament.status === 'pending' && 'Pendiente'} 
                  {tournament.status === 'registration_open' && 'Inscripciones abiertas'}
                  {tournament.status === 'in_progress' && 'En progreso'}
                  {tournament.status === 'completed' && 'Finalizado'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Participantes inscritos:</strong> {currentPlayers} / {tournament.maxParticipants}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enrollment */}
        {!isEnrolled && !isFull && tournament.status === 'registration_open' && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Inscripción</CardTitle>
              <CardDescription>
                {currentPlayers} / {tournament.maxParticipants} jugadores inscritos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleEnroll}
                className="bg-primary hover:bg-primary/90"
                disabled={enrolling}
              >
                {enrolling ? 'Inscribiendo...' : 'Inscribirse en el Torneo'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Participants List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Participantes Inscritos</CardTitle>
            <CardDescription>{participants.length} participantes confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {participants.map((participant, index) => {
                const name = participant.team?.name || participant.user?.username || `Participante ${index + 1}`;
                const type = participant.team ? 'Equipo' : 'Individual';
                const joinedAt = participant.joinedAt || participant.createdAt;

                return (
                  <div
                    key={participant._id || index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      {joinedAt ? new Date(joinedAt).toLocaleDateString() : 'Fecha desconocida'}
                    </div>
                  </div>
                );
              })}
            </div>

            {participants.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aún no hay participantes inscritos
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
