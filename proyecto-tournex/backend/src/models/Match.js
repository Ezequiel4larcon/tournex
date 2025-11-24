import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  matchNumber: {
    type: Number,
    required: true
  },
  participant1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant',
    default: null
  },
  participant2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant',
    default: null
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant',
    default: null
  },
  score: {
    participant1Score: {
      type: Number,
      default: 0
    },
    participant2Score: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledTime: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  // El owner del torneo valida los resultados (actúa como árbitro)
  assignedReferee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: null
  },
  nextMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    default: null
  },
  isBye: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices
matchSchema.index({ tournament: 1, round: 1 });
matchSchema.index({ tournament: 1, status: 1 });
matchSchema.index({ participant1: 1 });
matchSchema.index({ participant2: 1 });

export default mongoose.model('Match', matchSchema);
