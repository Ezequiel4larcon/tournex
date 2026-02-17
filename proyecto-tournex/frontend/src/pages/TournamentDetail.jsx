import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Users, Trophy, Calendar, CheckCircle2, Settings, Play, Grid3x3, Edit, UserX } from 'lucide-react';
import { tournamentsAPI } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { getSocket, joinTournament } from '../utils/socket';
import Spinner from '../components/ui/Spinner';
import { formatDateTimeLocal, formatDateES } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import ParticipantList from '../components/ParticipantList';
import DateEditModal from '../components/DateEditModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasMatches, setHasMatches] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Modales de fechas
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationDates, setRegistrationDates] = useState({ registrationStartDate: '', registrationEndDate: '' });
  const [showEditDatesModal, setShowEditDatesModal] = useState(false);
  const [tournamentDates, setTournamentDates] = useState({ startDate: '', endDate: '' });
  const [showEditRegistrationDatesModal, setShowEditRegistrationDatesModal] = useState(false);
  const [editRegistrationDates, setEditRegistrationDates] = useState({ registrationStartDate: '', registrationEndDate: '' });

  // Modal de ban
  const [showBanModal, setShowBanModal] = useState(false);
  const [participantToBan, setParticipantToBan] = useState(null);
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    loadTournament();

    const socket = getSocket();
    if (socket && id) {
      joinTournament(id);

      socket.on('tournament_updated', (updatedTournament) => {
        if (updatedTournament._id === id) setTournament(updatedTournament);
      });
      socket.on('participant_joined', ({ tournamentId, participant }) => {
        if (tournamentId === id) setParticipants((prev) => [...prev, participant]);
      });
      socket.on('participant_banned', ({ tournamentId, participant }) => {
        if (tournamentId === id) setParticipants((prev) => prev.filter((p) => p._id !== participant._id));
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
      setIsEnrolled(data.participants?.some((p) => p.player?._id === user?._id));
      setParticipants(data.participants || []);

      try {
        const matchesRes = await tournamentsAPI.getMatches(id);
        const matchesData = matchesRes.data.data || matchesRes.data;
        setHasMatches(matchesData && matchesData.length > 0);
      } catch {
        setHasMatches(false);
      }
    } catch (err) {
      console.error('Error loading tournament:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers de modales de fechas ---
  const handleOpenRegistrationModal = () => {
    setRegistrationDates({
      registrationStartDate: formatDateTimeLocal(tournament.registrationStartDate) || new Date().toISOString().slice(0, 16),
      registrationEndDate: formatDateTimeLocal(tournament.registrationEndDate) || formatDateTimeLocal(tournament.startDate)
    });
    setShowRegistrationModal(true);
  };

  const handleOpenRegistration = async () => {
    try {
      await tournamentsAPI.openRegistration(id, registrationDates);
      toast.success('¡Inscripciones abiertas exitosamente!');
      setShowRegistrationModal(false);
      loadTournament();
    } catch (err) {
      toast.error(`Error al abrir inscripciones: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenEditDatesModal = () => {
    setTournamentDates({
      startDate: formatDateTimeLocal(tournament.startDate) || new Date().toISOString().slice(0, 16),
      endDate: formatDateTimeLocal(tournament.endDate) || new Date().toISOString().slice(0, 16)
    });
    setShowEditDatesModal(true);
  };

  const handleUpdateDates = async () => {
    try {
      await tournamentsAPI.update(id, tournamentDates);
      toast.success('¡Fechas actualizadas exitosamente!');
      setShowEditDatesModal(false);
      loadTournament();
    } catch (err) {
      toast.error(`Error al actualizar fechas: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenEditRegistrationDatesModal = () => {
    setEditRegistrationDates({
      registrationStartDate: formatDateTimeLocal(tournament.registrationStartDate) || new Date().toISOString().slice(0, 16),
      registrationEndDate: formatDateTimeLocal(tournament.registrationEndDate) || new Date().toISOString().slice(0, 16)
    });
    setShowEditRegistrationDatesModal(true);
  };

  const handleUpdateRegistrationDates = async () => {
    try {
      await tournamentsAPI.update(id, editRegistrationDates);
      toast.success('¡Fechas de inscripciones actualizadas exitosamente!');
      setShowEditRegistrationDatesModal(false);
      loadTournament();
    } catch (err) {
      toast.error(`Error al actualizar fechas de inscripciones: ${err.response?.data?.message || err.message}`);
    }
  };

  // --- Handlers de acciones ---
  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await tournamentsAPI.register(id, {});
      toast.success('¡Te has inscrito exitosamente en el torneo!');
      loadTournament();
    } catch (err) {
      toast.error(`Error al inscribirse: ${err.response?.data?.message || err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartTournament = async () => {
    try {
      await tournamentsAPI.generateBracket(id);
      await tournamentsAPI.start(id);
      toast.success('¡Torneo iniciado exitosamente! Bracket generado y árbitros asignados');
      loadTournament();
    } catch (err) {
      toast.error(`Error al iniciar torneo: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleBanParticipant = async () => {
    if (!participantToBan) return;
    try {
      setBanning(true);
      await tournamentsAPI.banParticipant(id, participantToBan._id);
      toast.success(`${participantToBan.player?.username || participantToBan.user?.username || 'El participante'} ha sido baneado y removido del torneo`);
      setShowBanModal(false);
      setParticipantToBan(null);
      loadTournament();
    } catch (err) {
      toast.error(`Error al banear participante: ${err.response?.data?.message || err.message}`);
    } finally {
      setBanning(false);
    }
  };

  // --- Helpers ---
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'bg-muted/20 text-muted-foreground', text: 'Pendiente' },
      registration_open: { class: 'bg-accent/20 text-accent', text: 'Inscripciones Abiertas' },
      registration_closed: { class: 'bg-secondary/20 text-secondary', text: 'Próximamente' },
      in_progress: { class: 'bg-primary/20 text-primary', text: 'En Progreso' },
      completed: { class: 'bg-muted text-muted-foreground', text: 'Finalizado' },
      cancelled: { class: 'bg-destructive/20 text-destructive', text: 'Cancelado' },
    };
    return statusMap[status] || { class: 'bg-muted/20 text-muted-foreground', text: status };
  };

  const getFormatLabel = (format) => {
    const formats = { elimination: 'Eliminación Simple', double_elimination: 'Doble Eliminación', round_robin: 'Round Robin' };
    return formats[format] || format;
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Spinner text="Cargando torneo..." size="lg" /></div>;
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6">
          <p className="text-destructive">{error || 'Torneo no encontrado'}</p>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(tournament.status);
  const ownerId = tournament.owner?._id || tournament.owner;
  const userId = user?._id;
  const isOwner = ownerId && userId && ownerId === userId;
  const isSuperAdmin = user?.role === 'super_admin';
  const canModerate = isOwner || isSuperAdmin;
  const currentPlayers = participants.length;
  const isFull = currentPlayers >= tournament.maxParticipants;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/tournaments" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver a torneos
        </Link>

        {/* Tournament Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-2xl p-8 mb-8 hover:border-primary transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">{tournament.name}</h1>
              </div>
              <p className="text-lg text-muted-foreground">{tournament.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${statusBadge.class}`}>
              {statusBadge.text}
            </span>
          </div>
        </div>

        {/* Winner Section */}
        {tournament.status === 'completed' && tournament.winner && (
          <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-6">
              <Trophy className="w-16 h-16 text-yellow-500" />
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-3">¡Campeón del Torneo!</h2>
                <div className="flex items-center justify-center gap-4">
                  {tournament.winner.player?.avatar && (
                    <img src={tournament.winner.player.avatar} alt={tournament.winner.player.username} className="w-12 h-12 rounded-full border-2 border-yellow-500" />
                  )}
                  <div>
                    <p className="text-3xl font-bold text-yellow-500">{tournament.winner.player?.username || 'Ganador'}</p>
                    {tournament.winner.player?.email && <p className="text-sm text-muted-foreground">{tournament.winner.player.email}</p>}
                  </div>
                </div>
              </div>
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
          </div>
        )}

        {/* Info, Dates, Participants Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Info Card */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-6">Información</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Juego</p>
                <p className="text-sm font-medium text-foreground">{tournament.game}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Formato</p>
                <p className="text-sm font-medium text-foreground">{getFormatLabel(tournament.format)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Organizador</p>
                <p className="text-sm font-medium text-foreground">{tournament.owner?.username || tournament.createdBy?.username || 'Usuario'}</p>
              </div>
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-accent transition-all duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Fechas
            </h3>
            <div className="space-y-4">
              {tournament.status !== 'in_progress' && tournament.status !== 'completed' && (
                <>
                  {tournament.status === 'registration_open' ? (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Inscripciones Cierran</p>
                      <p className="text-sm font-medium text-accent">{formatDateES(tournament.registrationEndDate)}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Inscripciones Abren</p>
                        <p className="text-sm font-medium text-foreground">{formatDateES(tournament.registrationStartDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Inscripciones Cierran</p>
                        <p className="text-sm font-medium text-foreground">{formatDateES(tournament.registrationEndDate)}</p>
                      </div>
                    </>
                  )}
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Inicio del Torneo</p>
                <p className="text-sm font-medium text-foreground">{formatDateES(tournament.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fin del Torneo</p>
                <p className="text-sm font-medium text-foreground">{formatDateES(tournament.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Participants Count Card */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participantes
            </h3>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Jugadores</p>
              <p className="text-sm font-medium text-foreground">{currentPlayers} / {tournament.maxParticipants}</p>
            </div>
          </div>
        </div>

        {/* Moderator Controls */}
        {canModerate && (
          <div className="bg-primary/5 backdrop-blur-sm border border-primary/30 rounded-xl p-8 mb-8 hover:border-primary transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
                <Settings className="w-6 h-6" />
                Panel de Moderación
                {isOwner && <span className="text-xs bg-primary/20 px-2 py-1 rounded">Organizador</span>}
              </h3>
              <p className="text-muted-foreground">Controla y administra tu torneo</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {tournament.status !== 'completed' && tournament.status !== 'cancelled' && (
                <>
                  <Button onClick={handleOpenEditDatesModal} variant="outline" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Editar Fechas Torneo
                  </Button>
                  <Button onClick={handleOpenEditRegistrationDatesModal} variant="outline" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Editar Fechas Inscripciones
                  </Button>
                </>
              )}
              {tournament.status === 'pending' && (
                <Button onClick={handleOpenRegistrationModal} className="bg-accent hover:bg-accent/90 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Abrir Inscripciones
                </Button>
              )}
              {tournament.status === 'registration_open' && currentPlayers >= 2 && (
                <Button onClick={handleStartTournament} className="bg-accent hover:bg-accent/90 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Iniciar Torneo
                </Button>
              )}
            </div>
            <div className="mt-4 p-4 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Estado:</strong>{' '}
                {tournament.status === 'pending' && 'Pendiente'}
                {tournament.status === 'registration_open' && 'Inscripciones abiertas'}
                {tournament.status === 'in_progress' && 'En progreso'}
                {tournament.status === 'completed' && 'Finalizado'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Participantes inscritos:</strong> {currentPlayers} / {tournament.maxParticipants}
              </p>
            </div>
          </div>
        )}

        {/* Enrollment Section */}
        {!isOwner && tournament.status === 'registration_open' && (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 mb-8 hover:border-accent transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">Inscripción</h3>
              <p className="text-muted-foreground">{currentPlayers} / {tournament.maxParticipants} jugadores inscritos</p>
            </div>
            {isEnrolled ? (
              <div className="p-6 bg-accent/10 rounded-lg border border-accent/30">
                <div className="flex items-center gap-3 text-accent">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-medium text-lg">Ya estás inscrito en este torneo</span>
                </div>
              </div>
            ) : isFull ? (
              <div className="p-6 bg-muted/50 rounded-lg border border-border">
                <p className="text-muted-foreground">El torneo ha alcanzado el límite de participantes</p>
              </div>
            ) : (
              <Button onClick={handleEnroll} className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg transition-colors" disabled={enrolling}>
                {enrolling ? 'Inscribiendo...' : 'Inscribirse en el Torneo'}
              </Button>
            )}
          </div>
        )}

        {/* Not open for registration */}
        {!isOwner && tournament.status !== 'registration_open' && !isEnrolled && (
          <div className="bg-muted/20 backdrop-blur-sm border border-border rounded-xl p-8 mb-8">
            <p className="text-muted-foreground text-center text-lg">
              {tournament.status === 'pending' && 'Las inscripciones aún no han sido abiertas'}
              {tournament.status === 'in_progress' && 'El torneo ya está en progreso'}
              {tournament.status === 'completed' && 'Este torneo ha finalizado'}
              {tournament.status === 'cancelled' && 'Este torneo ha sido cancelado'}
            </p>
          </div>
        )}

        {/* View Bracket */}
        {hasMatches && (
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm border border-accent/30 rounded-2xl p-8 mb-8 hover:border-accent transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Grid3x3 className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Bracket del Torneo</h3>
              </div>
              <p className="text-muted-foreground">
                {tournament.status === 'in_progress' && 'El torneo está en progreso. Consulta las partidas y resultados'}
                {tournament.status === 'completed' && 'El torneo ha finalizado. Consulta los resultados finales'}
                {tournament.status === 'registration_closed' && 'El bracket ha sido generado. El torneo comenzará pronto'}
              </p>
            </div>
            <Button onClick={() => navigate(`/tournaments/${id}/bracket`)} className="bg-accent hover:bg-accent/90 flex items-center gap-2 w-full sm:w-auto px-6 py-3">
              <Grid3x3 className="w-4 h-4" />
              Ver Bracket y Partidas
            </Button>
          </div>
        )}

        {/* Participants List */}
        <ParticipantList
          participants={participants}
          isOwner={isOwner}
          tournamentStatus={tournament.status}
          onBan={(participant) => { setParticipantToBan(participant); setShowBanModal(true); }}
        />
      </div>

      {/* Modal: Abrir Inscripciones */}
      <DateEditModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        title="Abrir Inscripciones"
        description="Configura las fechas de inicio y fin de inscripciones"
        dates={registrationDates}
        onChange={(name, value) => setRegistrationDates(prev => ({ ...prev, [name]: value }))}
        onSubmit={handleOpenRegistration}
        submitText="Confirmar y Abrir"
        submitClassName="bg-accent hover:bg-accent/90"
        fields={[
          { name: 'registrationStartDate', label: 'Fecha de Inicio de Inscripciones' },
          { name: 'registrationEndDate', label: 'Fecha de Fin de Inscripciones' },
        ]}
      />

      {/* Modal: Editar Fechas del Torneo */}
      <DateEditModal
        isOpen={showEditDatesModal}
        onClose={() => setShowEditDatesModal(false)}
        title="Editar Fechas del Torneo"
        description="Modifica las fechas de inicio y fin del torneo"
        dates={tournamentDates}
        onChange={(name, value) => setTournamentDates(prev => ({ ...prev, [name]: value }))}
        onSubmit={handleUpdateDates}
        fields={[
          { name: 'startDate', label: 'Fecha de Inicio del Torneo' },
          { name: 'endDate', label: 'Fecha de Fin del Torneo' },
        ]}
      />

      {/* Modal: Editar Fechas de Inscripciones */}
      <DateEditModal
        isOpen={showEditRegistrationDatesModal}
        onClose={() => setShowEditRegistrationDatesModal(false)}
        title="Editar Fechas de Inscripciones"
        description="Modifica las fechas de apertura y cierre de inscripciones"
        dates={editRegistrationDates}
        onChange={(name, value) => setEditRegistrationDates(prev => ({ ...prev, [name]: value }))}
        onSubmit={handleUpdateRegistrationDates}
        fields={[
          { name: 'registrationStartDate', label: 'Fecha de Inicio de Inscripciones' },
          { name: 'registrationEndDate', label: 'Fecha de Fin de Inscripciones' },
        ]}
      />

      {/* Modal: Confirmar Ban */}
      <ConfirmDialog
        isOpen={showBanModal}
        onClose={() => { setShowBanModal(false); setParticipantToBan(null); }}
        onConfirm={handleBanParticipant}
        title={<span className="flex items-center gap-2"><UserX className="w-6 h-6" /> Banear Participante</span>}
        description="Esta acción removerá al participante del torneo"
        variant="destructive"
        confirmText={banning ? 'Baneando...' : 'Confirmar Baneo'}
        loading={banning}
        message={participantToBan && (
          <>
            <p className="text-sm text-foreground">
              ¿Estás seguro que deseas banear a{' '}
              <span className="font-bold text-destructive">
                {participantToBan.player?.username || participantToBan.user?.username || 'este participante'}
              </span>?
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              El participante será removido del torneo y no podrá volver a inscribirse.
            </p>
          </>
        )}
      />
    </main>
  );
}
