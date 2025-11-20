import mongoose from 'mongoose';

const tournamentParticipantSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  participantType: {
    type: String,
    enum: ['player', 'team'],
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'checked_in', 'eliminated'],
    default: 'pending'
  },
  seed: {
    type: Number,
    default: null
  },
  checkedInAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
tournamentParticipantSchema.index({ tournament: 1, status: 1 });
tournamentParticipantSchema.index({ tournament: 1, player: 1 });
tournamentParticipantSchema.index({ tournament: 1, team: 1 });

// Validación: debe tener player O team, no ambos
tournamentParticipantSchema.pre('validate', function(next) {
  if (this.participantType === 'player' && !this.player) {
    this.invalidate('player', 'Player is required for player-type participant');
  }
  if (this.participantType === 'team' && !this.team) {
    this.invalidate('team', 'Team is required for team-type participant');
  }
  if (this.player && this.team) {
    this.invalidate('player', 'Cannot have both player and team');
  }
  next();
});

export default mongoose.model('TournamentParticipant', tournamentParticipantSchema);
