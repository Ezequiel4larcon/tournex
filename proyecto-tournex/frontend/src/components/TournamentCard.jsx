import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Grid3x3 } from 'lucide-react';
import { getStatusLabel, getStatusClass } from '../utils/formatters';

export default function TournamentCard({ tournament, variant = 'participant', showBracketButton = false }) {
  const isModeratorView = variant === 'moderator';
  const hoverClass = isModeratorView ? 'hover:border-accent' : 'hover:border-primary';

  return (
    <div className={`bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 ${hoverClass} transition-all duration-300`}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <h4 className="text-xl font-semibold text-foreground">{tournament.name}</h4>
            {isModeratorView && (
              <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-lg border border-accent/20 whitespace-nowrap">
                Organizador
              </span>
            )}
            <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusClass(tournament.status)}`}>
              {getStatusLabel(tournament.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{tournament.game}</p>
          <p className="text-sm text-muted-foreground">
            {tournament.currentParticipants || tournament.participants?.length || 0} / {tournament.maxParticipants} jugadores
          </p>
        </div>
        <div className="flex gap-2">
          {showBracketButton && tournament.status === 'in_progress' && (
            <Link to={`/tournaments/${tournament._id}/bracket`}>
              <Button
                className={`${isModeratorView ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/90'} flex items-center gap-2 transition-colors`}
                size="sm"
              >
                <Grid3x3 className="w-4 h-4" />
                Bracket
              </Button>
            </Link>
          )}
          <Link to={`/tournaments/${tournament._id}`}>
            <Button
              variant={isModeratorView ? 'default' : 'outline'}
              size="sm"
              className={isModeratorView
                ? 'bg-accent hover:bg-accent/90 transition-colors'
                : 'hover:border-primary transition-colors'}
            >
              {isModeratorView && tournament.status !== 'completed' ? 'Moderar' : 'Ver Detalles'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
