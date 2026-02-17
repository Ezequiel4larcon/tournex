import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Trophy, Flame, Edit } from 'lucide-react';
import { tournamentsAPI, matchesAPI } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';
import MatchCard from '../components/MatchCard';
import MatchReportModal from '../components/MatchReportModal';
import StatsCard from '../components/ui/StatsCard';

export default function TournamentBracket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadTournamentData();
  }, [id]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentRes, matchesRes] = await Promise.all([
        tournamentsAPI.getById(id),
        tournamentsAPI.getMatches(id)
      ]);
      setTournament(tournamentRes.data.data || tournamentRes.data);
      setMatches(matchesRes.data.data || matchesRes.data || []);
    } catch (err) {
      console.error('Error loading tournament data:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleOpenReportModal = (match, isEdit = false) => {
    setSelectedMatch(match);
    setIsEditMode(isEdit);
    setShowReportModal(true);
  };

  const handleReportResult = async (reportData) => {
    if (!reportData.winnerId) {
      toast.warning('Selecciona un ganador');
      return;
    }

    const { participant1Score, participant2Score } = reportData.score;
    if (participant1Score === participant2Score) {
      toast.warning('Los puntajes no pueden ser iguales. Debe haber un ganador.');
      return;
    }

    const isParticipant1Winner = reportData.winnerId === selectedMatch.participant1._id;
    const winnerScore = isParticipant1Winner ? participant1Score : participant2Score;
    const loserScore = isParticipant1Winner ? participant2Score : participant1Score;

    if (winnerScore <= loserScore) {
      toast.warning('El ganador debe tener más puntos que el perdedor');
      return;
    }

    try {
      if (selectedMatch.status === 'completed' && isEditMode) {
        await matchesAPI.edit(selectedMatch._id, reportData);
        toast.success('¡Resultado editado exitosamente!');
      } else {
        await matchesAPI.report(selectedMatch._id, reportData);
        toast.success('¡Resultado reportado exitosamente!');
      }

      setShowReportModal(false);
      await loadTournamentData();

      const updatedTournament = await tournamentsAPI.getById(id);
      const tournamentData = updatedTournament.data.data || updatedTournament.data;

      if (tournamentData.status === 'completed') {
        toast.success('¡Torneo finalizado! El campeón ha sido coronado. 🏆');
        navigate(`/tournaments/${id}`);
      }
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSetMatchLive = async (matchId) => {
    try {
      await matchesAPI.setLive(matchId);
      toast.success('¡Partido marcado como EN VIVO!');
      loadTournamentData();
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleGenerateNextPhase = async (round) => {
    try {
      const confirmed = confirm(`¿Estás seguro de que deseas generar la siguiente fase después de la ronda ${round}?`);
      if (!confirmed) return;
      await tournamentsAPI.generateNextPhase(tournament._id, round);
      toast.success('¡Siguiente fase generada exitosamente!');
      loadTournamentData();
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleFinalizeTournament = async (round) => {
    try {
      const confirmed = confirm('¿Estás seguro de que deseas finalizar el torneo? Esta acción no se puede deshacer.');
      if (!confirmed) return;
      await tournamentsAPI.finalize(tournament._id, round);
      toast.success('¡Torneo finalizado exitosamente! 🏆');
      loadTournamentData();
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  // --- Helpers ---
  const isOwner = tournament && user && tournament.owner?._id === user._id;
  const isSuperAdmin = user?.role === 'super_admin';
  const canManageTournament = isOwner || isSuperAdmin;

  const canGenerateNextPhase = (round) => {
    if (!canManageTournament || tournament?.status === 'completed') return false;
    const currentRoundMatches = matches.filter(m => m.round === round);
    if (currentRoundMatches.length === 0) return false;
    const allCompleted = currentRoundMatches.every(m => m.status === 'completed');
    const nextRoundExists = matches.some(m => m.round === round + 1);
    return allCompleted && !nextRoundExists && currentRoundMatches.length > 1;
  };

  const canFinalizeTournament = (round) => {
    if (!canManageTournament || tournament?.status === 'completed') return false;
    const currentRoundMatches = matches.filter(m => m.round === round);
    if (currentRoundMatches.length !== 1) return false;
    const allCompleted = currentRoundMatches.every(m => m.status === 'completed');
    const nextRoundExists = matches.some(m => m.round === round + 1);
    return allCompleted && !nextRoundExists;
  };

  const canEditMatch = (match) => {
    if (tournament?.status === 'completed') return false;
    if (match.isBye || !match.participant1 || !match.participant2) return false;
    if (match.status !== 'in_progress' && match.status !== 'completed') return false;
    const currentRoundMatches = matches.filter(m => m.round === match.round);
    const allCurrentRoundCompleted = currentRoundMatches.every(m => m.status === 'completed');
    const nextRoundMatches = matches.filter(m => m.round === match.round + 1);
    if (allCurrentRoundCompleted && nextRoundMatches.length > 0) return false;
    return true;
  };

  const getRoundName = (round) => {
    const firstRoundMatches = matches.filter(m => m.round === 1).length;
    const totalParticipants = firstRoundMatches * 2;
    const expectedRounds = Math.log2(totalParticipants);
    if (round === expectedRounds) return 'Final';
    if (round === expectedRounds - 1) return 'Semifinales';
    if (round === expectedRounds - 2) return 'Cuartos de Final';
    if (round === expectedRounds - 3) return 'Octavos de Final';
    return `Ronda ${round}`;
  };

  const groupMatchesByRound = () => {
    const grouped = {};
    matches.forEach((match) => {
      const round = match.round || 1;
      if (!grouped[round]) grouped[round] = [];
      grouped[round].push(match);
    });
    return grouped;
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Spinner text="Cargando bracket..." size="lg" /></div>;
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/30 rounded-xl p-6 max-w-md">
          <p className="text-destructive text-center">{error || 'Torneo no encontrado'}</p>
        </div>
      </div>
    );
  }

  const matchesByRound = groupMatchesByRound();
  const rounds = Object.keys(matchesByRound).sort((a, b) => Number(a) - Number(b));
  const liveMatches = matches.filter(m => m.status === 'in_progress');
  const completedMatches = matches.filter(m => m.status === 'completed');
  const liveMatch = liveMatches[0];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to={`/tournaments/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al torneo
        </Link>

        {/* Tournament Header */}
        <div className={`bg-gradient-to-r ${tournament.status === 'in_progress' ? 'from-destructive/10 to-accent/10 border-destructive/30' : 'from-primary/10 to-accent/10 border-primary/30'} backdrop-blur-sm border rounded-xl p-8 mb-8`}>
          <div className="flex justify-between items-start">
            <div>
              {tournament.status === 'in_progress' && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-destructive" />
                  </div>
                  <span className="px-4 py-2 rounded-full bg-destructive/20 text-destructive font-semibold">EN VIVO AHORA</span>
                </div>
              )}
              <h1 className="text-4xl font-bold flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                {tournament.name}
              </h1>
              <p className="text-lg text-muted-foreground">{tournament.game} - Bracket del Torneo</p>
            </div>
          </div>
        </div>

        {/* Tournament Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard label="Total Matches" value={matches.length} colorClass="text-primary" hoverBorderClass="hover:border-primary" />
          <StatsCard label="Matches en Vivo" value={liveMatches.length} colorClass="text-destructive" hoverBorderClass="hover:border-destructive" />
          <StatsCard label="Matches Completados" value={completedMatches.length} colorClass="text-accent" hoverBorderClass="hover:border-accent" />
        </div>

        {/* Live Matches Section */}
        {liveMatches.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-destructive/10 to-accent/10 backdrop-blur-sm border border-destructive/30 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-destructive animate-pulse" />
                </div>
                Partidos en Vivo ({liveMatches.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map((match) => (
                  <div key={match._id} className="bg-card/80 backdrop-blur-sm border border-destructive/50 rounded-xl p-6 shadow-lg shadow-destructive/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-muted-foreground">Ronda {match.round} - Match #{match.matchNumber}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive font-medium text-xs">
                        <Flame className="w-3 h-3 animate-pulse" /> EN VIVO
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{match.participant1?.player?.username || 'TBD'}</span>
                        <span className="text-2xl font-bold text-destructive animate-pulse">{match.score?.participant1Score || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{match.participant2?.player?.username || 'TBD'}</span>
                        <span className="text-2xl font-bold text-destructive animate-pulse">{match.score?.participant2Score || 0}</span>
                      </div>
                    </div>
                    {canManageTournament && (
                      <Button size="sm" onClick={() => handleOpenReportModal(match, false)} className="w-full mt-4 bg-primary hover:bg-primary/90">
                        <Edit className="w-3 h-3 mr-1" /> Reportar Resultado
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bracket Display */}
        <div className="space-y-8">
          {rounds.map((round) => {
            const roundNumber = Number(round);
            const showGenerateButton = canGenerateNextPhase(roundNumber);
            const showFinalizeButton = canFinalizeTournament(roundNumber);

            return (
              <div key={round} className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 hover:border-primary transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {getRoundName(roundNumber)} ({matchesByRound[round].length} matches)
                  </h2>
                  <div className="flex gap-3">
                    {showGenerateButton && (
                      <Button onClick={() => handleGenerateNextPhase(roundNumber)} className="bg-accent hover:bg-accent/90">
                        <Trophy className="w-4 h-4 mr-2" /> Generar Siguiente Fase
                      </Button>
                    )}
                    {showFinalizeButton && (
                      <Button onClick={() => handleFinalizeTournament(roundNumber)} className="bg-primary hover:bg-primary/90">
                        <Trophy className="w-4 h-4 mr-2" /> Finalizar Torneo 🏆
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {matchesByRound[round].map((match) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      canManage={canManageTournament}
                      onSetLive={handleSetMatchLive}
                      onReport={handleOpenReportModal}
                      onEdit={(m) => handleOpenReportModal(m, true)}
                      canEditMatch={canEditMatch}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {matches.length === 0 && (
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8">
            <p className="text-center text-muted-foreground py-8">Aún no se han generado los matches del torneo</p>
          </div>
        )}

        {/* Live Match Detail */}
        {liveMatch && (
          <div className="mt-8">
            <div className="bg-gradient-to-b from-destructive/10 to-card/50 backdrop-blur-sm border border-destructive/30 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-destructive animate-pulse" />
                </div>
                Match en Vivo Ahora
              </h2>
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{liveMatch.participant1?.player?.username?.charAt(0).toUpperCase() || 'P'}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{liveMatch.participant1?.player?.username || 'TBD'}</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-destructive mb-4 animate-pulse">
                    {liveMatch.score?.participant1Score || 0} - {liveMatch.score?.participant2Score || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Ronda {liveMatch.round} en progreso</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent">{liveMatch.participant2?.player?.username?.charAt(0).toUpperCase() || 'P'}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{liveMatch.participant2?.player?.username || 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para reportar resultado */}
      <MatchReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        match={selectedMatch}
        isEditMode={isEditMode}
        onSubmit={handleReportResult}
      />
    </main>
  );
}
