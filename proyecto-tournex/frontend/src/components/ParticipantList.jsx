import { CheckCircle2, UserX } from 'lucide-react';
import { Button } from './ui/Button';

export default function ParticipantList({ participants, isOwner, tournamentStatus, onBan }) {
  const canBan = isOwner && (tournamentStatus === 'registration_open' || tournamentStatus === 'in_progress');
  const visibleParticipants = participants.filter(p => p.status !== 'banned');

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 hover:border-primary transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Participantes Inscritos</h3>
        <p className="text-muted-foreground">{visibleParticipants.length} participantes confirmados</p>
      </div>
      <div className="space-y-3">
        {visibleParticipants.map((participant, index) => {
          const name = participant.player?.username || participant.user?.username || `Participante ${index + 1}`;
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
                    onClick={() => onBan(participant)}
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

        {visibleParticipants.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aún no hay participantes inscritos
          </p>
        )}
      </div>
    </div>
  );
}
