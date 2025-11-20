import mongoose from 'mongoose';

const teamMembershipRequestSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [300, 'Message cannot exceed 300 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
teamMembershipRequestSchema.index({ team: 1, status: 1 });
teamMembershipRequestSchema.index({ player: 1, status: 1 });

// Un jugador no puede tener múltiples solicitudes pendientes al mismo equipo
teamMembershipRequestSchema.index({ team: 1, player: 1 }, { unique: true });

export default mongoose.model('TeamMembershipRequest', teamMembershipRequestSchema);
