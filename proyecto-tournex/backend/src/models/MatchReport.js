import mongoose from 'mongoose';

const matchReportSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentParticipant',
    required: true
  },
  score: {
    participant1Score: {
      type: Number,
      required: true
    },
    participant2Score: {
      type: Number,
      required: true
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  validated: {
    type: Boolean,
    default: false
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
  disputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String,
    maxlength: [500, 'Dispute reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Índices
matchReportSchema.index({ match: 1 });
matchReportSchema.index({ reportedBy: 1 });

export default mongoose.model('MatchReport', matchReportSchema);
