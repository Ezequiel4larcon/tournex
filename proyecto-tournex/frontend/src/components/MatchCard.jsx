import { Button } from './ui/Button';
import { Flame, Clock, Edit } from 'lucide-react';

function getStatusBadge(status) {
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
}

export default function MatchCard({ match, canManage, onSetLive, onReport, onEdit, canEditMatch }) {
  const player1 = match.participant1?.player?.username || 'TBD';
  const player2 = match.participant2?.player?.username || 'BYE';
  const score1 = match.score?.participant1Score || 0;
  const score2 = match.score?.participant2Score || 0;
  const isByeMatch = match.isBye || !match.participant2;

  return (
    <div
      className={`bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary transition-all duration-300 ${
        match.status === 'in_progress' ? 'border-destructive/50 shadow-lg shadow-destructive/20' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground mb-2">{player1}</div>
            <div className="text-sm font-semibold text-foreground text-right">{player2}</div>
          </div>
          <div className="ml-4 text-right">
            {match.status === 'completed' ? (
              <div className="space-y-1">
                <div className={`text-lg font-bold ${match.winner?.toString() === match.participant1?._id?.toString() ? 'text-accent' : 'text-muted-foreground'}`}>
                  {score1}
                </div>
                <div className={`text-lg font-bold ${match.winner?.toString() === match.participant2?._id?.toString() ? 'text-accent' : 'text-muted-foreground'}`}>
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

        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {match.round && `Ronda ${match.round}`}
              {match.matchNumber && ` - Match #${match.matchNumber}`}
              {isByeMatch && <span className="ml-2 text-accent">(Pase automático)</span>}
            </div>
            {getStatusBadge(match.status)}
          </div>

          {canManage && match.status === 'pending' && match.participant1 && match.participant2 && !isByeMatch && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onSetLive(match._id)} className="flex-1 bg-destructive hover:bg-destructive/90">
                <Flame className="w-3 h-3 mr-1" />
                Iniciar
              </Button>
              <Button size="sm" onClick={() => onReport(match, false)} className="flex-1 bg-primary hover:bg-primary/90">
                <Edit className="w-3 h-3 mr-1" />
                Reportar
              </Button>
            </div>
          )}

          {canManage && match.status === 'in_progress' && !isByeMatch && (
            <Button size="sm" onClick={() => onReport(match, false)} className="w-full bg-primary hover:bg-primary/90">
              <Edit className="w-3 h-3 mr-1" />
              Reportar Resultado
            </Button>
          )}

          {canManage && match.status === 'completed' && !isByeMatch && canEditMatch(match) && (
            <Button size="sm" onClick={() => onEdit(match)} variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
