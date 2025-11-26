import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Users, Trophy, Calendar, Zap, CheckCircle2, Settings, Play, Grid3x3, Edit, UserX } from 'lucide-react';
import { tournamentsAPI } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { getSocket, joinTournament } from '../utils/socket';

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasMatches, setHasMatches] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationDates, setRegistrationDates] = useState({
    registrationStartDate: '',
    registrationEndDate: ''
  });
  const [showEditDatesModal, setShowEditDatesModal] = useState(false);
  const [tournamentDates, setTournamentDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [showEditRegistrationDatesModal, setShowEditRegistrationDatesModal] = useState(false);
  const [editRegistrationDates, setEditRegistrationDates] = useState({
    registrationStartDate: '',
    registrationEndDate: ''
  });
  const [showBanModal, setShowBanModal] = useState(false);
  const [participantToBan, setParticipantToBan] = useState(null);
  const [banning, setBanning] = useState(false);

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

      socket.on('participant_banned', ({ tournamentId, participant }) => {
        if (tournamentId === id) {
          // Remover el participante baneado de la lista
          setParticipants((prev) =>
            prev.filter((p) => p._id !== participant._id)
          );
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('tournament_updated');
        socket.off('participant_joined');
        socket.off('participant_banned');
      }
    };
  }, [id]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      const response = await tournamentsAPI.getById(id);
      const data = response.data.data || response.data;
      setTournament(data);
      
      console.log('Tournament data:', data);
      console.log('Winner:', data.winner);
      console.log('Status:', data.status);
      
      // Verificar si el usuario está inscrito (solo jugadores individuales ahora)
      const enrolled = data.participants?.some((p) => p.player?._id === user?._id);
      setIsEnrolled(enrolled);
      
      // Cargar participantes
      setParticipants(data.participants || []);
      
      // Verificar si hay matches generados
      try {
        const matchesRes = await tournamentsAPI.getMatches(id);
        const matchesData = matchesRes.data.data || matchesRes.data;
        setHasMatches(matchesData && matchesData.length > 0);
      } catch (err) {
        setHasMatches(false);
      }
    } catch (err) {
      console.error('Error loading tournament:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegistrationModal = () => {
    // Función helper para formatear fecha a datetime-local
    const formatDateTimeLocal = (date) => {
      if (!date) return '';
      const d = new Date(date);
      // Ajustar a zona horaria local
      const offset = d.getTimezoneOffset() * 60000;
      const localDate = new Date(d.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    };

    // Prellenar con las fechas actuales del torneo
    setRegistrationDates({
      registrationStartDate: formatDateTimeLocal(tournament.registrationStartDate) || new Date().toISOString().slice(0, 16),
      registrationEndDate: formatDateTimeLocal(tournament.registrationEndDate) || formatDateTimeLocal(tournament.startDate)
    });
    setShowRegistrationModal(true);
  };

  const handleOpenRegistration = async () => {
    try {
      await tournamentsAPI.openRegistration(id, registrationDates);
      alert('¡Inscripciones abiertas exitosamente!');
      setShowRegistrationModal(false);
      loadTournament();
    } catch (err) {
      alert(`Error al abrir inscripciones: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenEditDatesModal = () => {
    // Función helper para formatear fecha a datetime-local
    const formatDateTimeLocal = (date) => {
      if (!date) return '';
      const d = new Date(date);
      // Ajustar a zona horaria local
      const offset = d.getTimezoneOffset() * 60000;
      const localDate = new Date(d.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    };

    setTournamentDates({
      startDate: formatDateTimeLocal(tournament.startDate) || new Date().toISOString().slice(0, 16),
      endDate: formatDateTimeLocal(tournament.endDate) || new Date().toISOString().slice(0, 16)
    });
    setShowEditDatesModal(true);
  };

  const handleUpdateDates = async () => {
    try {
      await tournamentsAPI.update(id, tournamentDates);
      alert('¡Fechas actualizadas exitosamente!');
      setShowEditDatesModal(false);
      loadTournament();
    } catch (err) {
      alert(`Error al actualizar fechas: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenEditRegistrationDatesModal = () => {
    // Función helper para formatear fecha a datetime-local
    const formatDateTimeLocal = (date) => {
      if (!date) return '';
      const d = new Date(date);
      // Ajustar a zona horaria local
      const offset = d.getTimezoneOffset() * 60000;
      const localDate = new Date(d.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    };

    setEditRegistrationDates({
      registrationStartDate: formatDateTimeLocal(tournament.registrationStartDate) || new Date().toISOString().slice(0, 16),
      registrationEndDate: formatDateTimeLocal(tournament.registrationEndDate) || new Date().toISOString().slice(0, 16)
    });
    setShowEditRegistrationDatesModal(true);
  };

  const handleUpdateRegistrationDates = async () => {
    try {
      await tournamentsAPI.update(id, editRegistrationDates);
      alert('¡Fechas de inscripciones actualizadas exitosamente!');
      setShowEditRegistrationDatesModal(false);
      loadTournament();
    } catch (err) {
      alert(`Error al actualizar fechas de inscripciones: ${err.response?.data?.message || err.message}`);
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

  const handleStartTournament = async () => {
    try {
      // Primero generar el bracket
      await tournamentsAPI.generateBracket(id);
      // Luego iniciar el torneo
      await tournamentsAPI.start(id);
      alert('¡Torneo iniciado exitosamente! Bracket generado y árbitros asignados');
      loadTournament();
    } catch (err) {
      alert(`Error al iniciar torneo: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenBanModal = (participant) => {
    setParticipantToBan(participant);
    setShowBanModal(true);
  };

  const handleBanParticipant = async () => {
    if (!participantToBan) return;

    try {
      setBanning(true);
      await tournamentsAPI.banParticipant(id, participantToBan._id);
      alert(`${participantToBan.player?.username || participantToBan.user?.username || 'El participante'} ha sido baneado y removido del torneo`);
      setShowBanModal(false);
      setParticipantToBan(null);
      loadTournament();
    } catch (err) {
      alert(`Error al banear participante: ${err.response?.data?.message || err.message}`);
    } finally {
      setBanning(false);
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
  
  // Verificar si el usuario es el owner del torneo
  const ownerId = tournament.owner?._id || tournament.owner;
  const userId = user?._id;
  const isOwner = ownerId && userId && ownerId === userId;
  
  const isSuperAdmin = user?.role === 'super_admin';
  const canModerate = isOwner || isSuperAdmin;
  const currentPlayers = participants.length;
  const isFull = currentPlayers >= tournament.maxParticipants;

  return (
    <main className="min-h-screen bg-background">
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

        {/* Winner Section - Only show when tournament is completed */}
        {tournament.status === 'completed' && tournament.winner && (
          <Card className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-yellow-500/30 mb-8">
            <CardHeader>
              <div className="flex items-center justify-center gap-4">
                <Trophy className="w-12 h-12 text-yellow-500" />
                <div className="text-center">
                  <CardTitle className="text-2xl mb-2">¡Campeón del Torneo!</CardTitle>
                  <div className="flex items-center justify-center gap-3">
                    {tournament.winner.player?.avatar && (
                      <img 
                        src={tournament.winner.player.avatar} 
                        alt={tournament.winner.player.username}
                        className="w-12 h-12 rounded-full border-2 border-yellow-500"
                      />
                    )}
                    <div>
                      <p className="text-3xl font-bold text-yellow-500">
                        {tournament.winner.player?.username || 'Ganador'}
                      </p>
                      {tournament.winner.player?.email && (
                        <p className="text-sm text-muted-foreground">
                          {tournament.winner.player.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
            </CardHeader>
          </Card>
        )}

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
              {tournament.status === 'registration_open' ? (
                // Si las inscripciones están abiertas, solo mostrar fecha de cierre
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Inscripciones Cierran</p>
                  <p className="text-sm font-medium text-accent">
                    {tournament.registrationEndDate 
                      ? new Date(tournament.registrationEndDate).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'No definido'}
                  </p>
                </div>
              ) : (
                // Para otros estados, mostrar todas las fechas
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Inscripciones Abren</p>
                    <p className="text-sm font-medium text-foreground">
                      {tournament.registrationStartDate 
                        ? new Date(tournament.registrationStartDate).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Inscripciones Cierran</p>
                    <p className="text-sm font-medium text-foreground">
                      {tournament.registrationEndDate 
                        ? new Date(tournament.registrationEndDate).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'No definido'}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Inicio del Torneo</p>
                <p className="text-sm font-medium text-foreground">
                  {tournament.startDate 
                    ? new Date(tournament.startDate).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'No definido'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Fin del Torneo</p>
                <p className="text-sm font-medium text-foreground">
                  {tournament.endDate 
                    ? new Date(tournament.endDate).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'No definido'}
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
                {/* Botón para editar fechas del torneo - siempre disponible si no está completado */}
                {tournament.status !== 'completed' && tournament.status !== 'cancelled' && (
                  <Button 
                    onClick={handleOpenEditDatesModal} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Editar Fechas Torneo
                  </Button>
                )}

                {/* Botón para editar fechas de inscripciones - siempre disponible si no está completado */}
                {tournament.status !== 'completed' && tournament.status !== 'cancelled' && (
                  <Button 
                    onClick={handleOpenEditRegistrationDatesModal} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Fechas Inscripciones
                  </Button>
                )}

                {tournament.status === 'pending' && (
                  <Button 
                    onClick={handleOpenRegistrationModal} 
                    className="bg-accent hover:bg-accent/90 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Abrir Inscripciones
                  </Button>
                )}
                
                {tournament.status === 'registration_open' && currentPlayers >= 2 && (
                  <Button 
                    onClick={handleStartTournament} 
                    className="bg-accent hover:bg-accent/90 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Torneo
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

        {/* Enrollment Section */}
        {!isOwner && tournament.status === 'registration_open' && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Inscripción</CardTitle>
              <CardDescription>
                {currentPlayers} / {tournament.maxParticipants} jugadores inscritos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEnrolled ? (
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Ya estás inscrito en este torneo</span>
                </div>
              ) : isFull ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    El torneo ha alcanzado el límite de participantes
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleEnroll}
                  className="bg-primary hover:bg-primary/90"
                  disabled={enrolling}
                >
                  {enrolling ? 'Inscribiendo...' : 'Inscribirse en el Torneo'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tournament not open for registration */}
        {!isOwner && tournament.status !== 'registration_open' && !isEnrolled && (
          <Card className="bg-muted/30 border-border mb-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                {tournament.status === 'pending' && 'Las inscripciones aún no han sido abiertas'}
                {tournament.status === 'in_progress' && 'El torneo ya está en progreso'}
                {tournament.status === 'completed' && 'Este torneo ha finalizado'}
                {tournament.status === 'cancelled' && 'Este torneo ha sido cancelado'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Bracket - Available for all users when matches exist */}
        {hasMatches && (
          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Bracket del Torneo
              </CardTitle>
              <CardDescription>
                {tournament.status === 'in_progress' && 'El torneo está en progreso. Consulta las partidas y resultados'}
                {tournament.status === 'completed' && 'El torneo ha finalizado. Consulta los resultados finales'}
                {tournament.status === 'registration_closed' && 'El bracket ha sido generado. El torneo comenzará pronto'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(`/tournaments/${id}/bracket`)}
                className="bg-accent hover:bg-accent/90 flex items-center gap-2 w-full sm:w-auto"
              >
                <Grid3x3 className="w-4 h-4" />
                Ver Bracket y Partidas
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
              {participants
                .filter(participant => participant.status !== 'banned') // Filtrar participantes baneados
                .map((participant, index) => {
                const name = participant.player?.username || participant.user?.username || `Participante ${index + 1}`;
                const joinedAt = participant.joinedAt || participant.createdAt;
                const canBan = isOwner && 
                              (tournament.status === 'registration_open' || tournament.status === 'in_progress');

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
                        <p className="text-xs text-muted-foreground">Jugador</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        {joinedAt ? new Date(joinedAt).toLocaleDateString() : 'Fecha desconocida'}
                      </div>
                      {canBan && (
                        <Button
                          onClick={() => handleOpenBanModal(participant)}
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive px-3 py-1 h-auto text-xs"
                        >
                          <UserX className="w-3 h-3 mr-1" />
                          Banear
                        </Button>
                      )}
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

      {/* Modal para Abrir Inscripciones */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-md w-full">
            <CardHeader>
              <CardTitle>Abrir Inscripciones</CardTitle>
              <CardDescription>
                Configura las fechas de inicio y fin de inscripciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de Inicio de Inscripciones
                </label>
                <input
                  type="datetime-local"
                  value={registrationDates.registrationStartDate}
                  onChange={(e) => setRegistrationDates(prev => ({
                    ...prev,
                    registrationStartDate: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de Fin de Inscripciones
                </label>
                <input
                  type="datetime-local"
                  value={registrationDates.registrationEndDate}
                  onChange={(e) => setRegistrationDates(prev => ({
                    ...prev,
                    registrationEndDate: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleOpenRegistration}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  Confirmar y Abrir
                </Button>
                <Button
                  onClick={() => setShowRegistrationModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Editar Fechas del Torneo */}
      {showEditDatesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-md w-full">
            <CardHeader>
              <CardTitle>Editar Fechas del Torneo</CardTitle>
              <CardDescription>
                Modifica las fechas de inicio y fin del torneo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de Inicio del Torneo
                </label>
                <input
                  type="datetime-local"
                  value={tournamentDates.startDate}
                  onChange={(e) => setTournamentDates(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de Fin del Torneo
                </label>
                <input
                  type="datetime-local"
                  value={tournamentDates.endDate}
                  onChange={(e) => setTournamentDates(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpdateDates}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => setShowEditDatesModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Editar Fechas de Inscripciones */}
      {showEditRegistrationDatesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-md w-full">
            <CardHeader>
              <CardTitle>Editar Fechas de Inscripciones</CardTitle>
              <CardDescription>
                Modifica las fechas de apertura y cierre de inscripciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de Inicio de Inscripciones
                </label>
                <input
                  type="datetime-local"
                  value={editRegistrationDates.registrationStartDate}
                  onChange={(e) => setEditRegistrationDates(prev => ({
                    ...prev,
                    registrationStartDate: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de Fin de Inscripciones
                </label>
                <input
                  type="datetime-local"
                  value={editRegistrationDates.registrationEndDate}
                  onChange={(e) => setEditRegistrationDates(prev => ({
                    ...prev,
                    registrationEndDate: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpdateRegistrationDates}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => setShowEditRegistrationDatesModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Confirmar Baneo de Participante */}
      {showBanModal && participantToBan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <UserX className="w-5 h-5" />
                Banear Participante
              </CardTitle>
              <CardDescription>
                Esta acción removerá al participante del torneo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-foreground">
                  ¿Estás seguro que deseas banear a{' '}
                  <span className="font-bold text-destructive">
                    {participantToBan.player?.username || participantToBan.user?.username || 'este participante'}
                  </span>
                  ?
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  El participante será removido del torneo y no podrá volver a inscribirse.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleBanParticipant}
                  disabled={banning}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {banning ? 'Baneando...' : 'Confirmar Baneo'}
                </Button>
                <Button
                  onClick={() => {
                    setShowBanModal(false);
                    setParticipantToBan(null);
                  }}
                  disabled={banning}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
