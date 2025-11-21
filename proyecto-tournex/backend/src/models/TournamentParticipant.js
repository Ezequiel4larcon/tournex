import mongoose from 'mongoose';

const tournamentParticipantSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'checked_in', 'eliminated', 'winner'],
    default: 'registered'
  },
  seed: {
    type: Number,
    default: null
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  // Estadísticas del jugador en el torneo
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices
tournamentParticipantSchema.index({ tournament: 1, player: 1 }, { unique: true });
tournamentParticipantSchema.index({ tournament: 1, status: 1 });

export default mongoose.model('TournamentParticipant', tournamentParticipantSchema);
