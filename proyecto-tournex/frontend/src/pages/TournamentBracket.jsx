import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Trophy, Flame, Clock, Edit } from 'lucide-react';
import { tournamentsAPI, matchesAPI } from '../api/api';
import { useAuth } from '../hooks/useAuth';

export default function TournamentBracket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [reportData, setReportData] = useState({
    winnerId: '',
    score: { participant1Score: 0, participant2Score: 0 },
    notes: ''
  });

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

      const tournamentData = tournamentRes.data.data || tournamentRes.data;
      setTournament(tournamentData);

      const matchesData = matchesRes.data.data || matchesRes.data;
      setMatches(matchesData || []);
    } catch (err) {
      console.error('Error loading tournament data:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportModal = (match) => {
    setSelectedMatch(match);
    setReportData({
      winnerId: '',
      score: { participant1Score: 0, participant2Score: 0 },
      notes: ''
    });
    setShowReportModal(true);
  };

  const handleReportResult = async () => {
    if (!reportData.winnerId) {
      alert('Selecciona un ganador');
      return;
    }

    // Validar que el ganador tenga más puntos
    const participant1Score = reportData.score.participant1Score || 0;
    const participant2Score = reportData.score.participant2Score || 0;

    if (participant1Score === participant2Score) {
      alert('Los puntajes no pueden ser iguales. Debe haber un ganador.');
      return;
    }

    const isParticipant1Winner = reportData.winnerId === selectedMatch.participant1._id;
    const winnerScore = isParticipant1Winner ? participant1Score : participant2Score;
    const loserScore = isParticipant1Winner ? participant2Score : participant1Score;

    if (winnerScore <= loserScore) {
      alert('El ganador debe tener más puntos que el perdedor');
      return;
    }

    try {
      await matchesAPI.report(selectedMatch._id, reportData);
      setShowReportModal(false);
      await loadTournamentData();
      
      // Si el torneo se completó, mostrar mensaje especial y navegar a detalles
      const updatedTournament = await tournamentsAPI.getById(id);
      const tournamentData = updatedTournament.data.data || updatedTournament.data;
      
      if (tournamentData.status === 'completed') {
        alert('¡Torneo finalizado! El campeón ha sido coronado.');
        navigate(`/tournaments/${id}`);
      } else {
        alert('¡Resultado reportado exitosamente!');
      }
    } catch (err) {
      alert(`Error al reportar resultado: ${err.response?.data?.message || err.message}`);
    }
  };

  const isOwner = tournament && user && tournament.owner?._id === user._id;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/20 text-destructive font-medium text-xs">
            <Flame className="w-3 h-3" />
            EN VIVO
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent font-medium text-xs">
            ✓ Completado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/20 text-secondary font-medium text-xs">
            <Clock className="w-3 h-3" />
            Próximo
          </span>
        );
      default:
        return null;
    }
  };

  const MatchCard = ({ match }) => {
    const player1 = match.participant1?.player?.username || 'TBD';
    const player2 = match.participant2?.player?.username || 'TBD';
    const score1 = match.score?.participant1Score || 0;
    const score2 = match.score?.participant2Score || 0;

    return (
      <Card
        className={`bg-card border-border hover:border-primary/50 transition-all ${
          match.status === 'in_progress' ? 'border-destructive/50 shadow-lg shadow-destructive/20' : ''
        }`}
      >
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground mb-2">{player1}</div>
                <div className="text-sm font-semibold text-foreground text-right">{player2}</div>
              </div>
              <div className="ml-4 text-right">
                {match.status === 'completed' ? (
                  <div className="space-y-1">
                    <div
                      className={`text-lg font-bold ${match.winner?.toString() === match.participant1?._id?.toString() ? 'text-accent' : 'text-muted-foreground'}`}
                    >
                      {score1}
                    </div>
                    <div
                      className={`text-lg font-bold ${match.winner?.toString() === match.participant2?._id?.toString() ? 'text-accent' : 'text-muted-foreground'}`}
                    >
                      {score2}
                    </div>
                  </div>
                ) : match.status === 'in_progress' ? (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-destructive animate-pulse">{score1}</div>
                    <div className="text-lg font-bold text-destructive animate-pulse">{score2}</div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">-</div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {match.round && `Ronda ${match.round}`}
                {match.matchNumber && ` - Match #${match.matchNumber}`}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(match.status)}
                {isOwner && match.status === 'pending' && match.participant1 && match.participant2 && (
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenReportModal(match)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Reportar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Agrupar matches por ronda
  const groupMatchesByRound = () => {
    const grouped = {};
    matches.forEach((match) => {
      const round = match.round || 1;
      if (!grouped[round]) {
        grouped[round] = [];
      }
      grouped[round].push(match);
    });
    return grouped;
  };

  const getRoundName = (round, totalRounds) => {
    // Calcular el nombre basado en el número de matches en la primera ronda
    // Esto determina cuántos participantes hay en el torneo
    const firstRoundMatches = matches.filter(m => m.round === 1).length;
    const totalParticipants = firstRoundMatches * 2; // Cada match tiene 2 participantes
    
    // Calcular el total de rondas esperadas según los participantes
    const expectedRounds = Math.log2(totalParticipants);
    
    // Determinar el nombre de la ronda según la estructura del torneo
    if (round === expectedRounds) return 'Final';
    if (round === expectedRounds - 1) return 'Semifinales';
    if (round === expectedRounds - 2) return 'Cuartos de Final';
    if (round === expectedRounds - 3) return 'Octavos de Final';
    return `Ronda ${round}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando bracket...</p>
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

  const matchesByRound = groupMatchesByRound();
  const rounds = Object.keys(matchesByRound).sort((a, b) => Number(a) - Number(b));
  const liveMatches = matches.filter(m => m.status === 'in_progress');
  const completedMatches = matches.filter(m => m.status === 'completed');
  const liveMatch = liveMatches[0];

  return (
    <main className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to={`/tournaments/${id}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al torneo
        </Link>

        {/* Tournament Header */}
        <Card className={`bg-gradient-to-r ${tournament.status === 'in_progress' ? 'from-destructive/10 to-accent/10 border-destructive/30' : 'from-primary/10 to-accent/10 border-primary/30'} mb-8`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                {tournament.status === 'in_progress' && (
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-6 h-6 text-destructive" />
                    <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive font-semibold text-sm">
                      EN VIVO AHORA
                    </span>
                  </div>
                )}
                <CardTitle className="text-3xl flex items-center gap-3 mt-4">
                  <Trophy className="w-8 h-8 text-primary" />
                  {tournament.name}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {tournament.game} - Bracket del Torneo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tournament Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{matches.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Matches en Vivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">{liveMatches.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Matches Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{completedMatches.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bracket Display */}
        <div className="space-y-8">
          {rounds.map((round) => (
            <Card key={round} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getRoundName(Number(round), rounds.length)} ({matchesByRound[round].length} matches)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {matchesByRound[round].map((match) => (
                    <MatchCard key={match._id} match={match} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {matches.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Aún no se han generado los matches del torneo
              </p>
            </CardContent>
          </Card>
        )}

        {/* Live Match Detail */}
        {liveMatch && (
          <div className="mt-8">
            <Card className="bg-gradient-to-b from-destructive/10 to-card border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-destructive animate-pulse" />
                  Match en Vivo Ahora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {liveMatch.participant1?.player?.username?.charAt(0).toUpperCase() || 'P'}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {liveMatch.participant1?.player?.username || 'TBD'}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-5xl font-bold text-destructive mb-4 animate-pulse">
                      {liveMatch.score?.participant1Score || 0} - {liveMatch.score?.participant2Score || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ronda {liveMatch.round} en progreso
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">
                        {liveMatch.participant2?.player?.username?.charAt(0).toUpperCase() || 'P'}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {liveMatch.participant2?.player?.username || 'TBD'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal para reportar resultado */}
      {showReportModal && selectedMatch && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowReportModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="bg-card border-border max-w-md w-full">
              <CardHeader>
                <CardTitle>Reportar Resultado del Match</CardTitle>
                <CardDescription>
                  Ronda {selectedMatch.round} - Match #{selectedMatch.matchNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seleccionar ganador */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Ganador</label>
                  <div className="space-y-2">
                    <div 
                      className={`p-3 border rounded-md cursor-pointer transition ${
                        reportData.winnerId === selectedMatch.participant1._id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setReportData({...reportData, winnerId: selectedMatch.participant1._id})}
                    >
                      <p className="font-medium">{selectedMatch.participant1.player?.username}</p>
                    </div>
                    <div 
                      className={`p-3 border rounded-md cursor-pointer transition ${
                        reportData.winnerId === selectedMatch.participant2._id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setReportData({...reportData, winnerId: selectedMatch.participant2._id})}
                    >
                      <p className="font-medium">{selectedMatch.participant2.player?.username}</p>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Score {selectedMatch.participant1.player?.username}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={reportData.score.participant1Score}
                      onChange={(e) => setReportData({
                        ...reportData, 
                        score: {...reportData.score, participant1Score: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Score {selectedMatch.participant2.player?.username}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={reportData.score.participant2Score}
                      onChange={(e) => setReportData({
                        ...reportData, 
                        score: {...reportData.score, participant2Score: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReportModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleReportResult}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Reportar Resultado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
