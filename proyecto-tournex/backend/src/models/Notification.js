import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'team_invitation',
      'team_request_accepted',
      'team_request_rejected',
      'team_kicked',
      'tournament_registration_confirmed',
      'match_assigned',
      'match_reported',
      'match_scheduled',
      'match_result_disputed',
      'referee_reassigned',
      'tournament_started',
      'tournament_completed',
      'message_received'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Tournament', 'Match', 'Team', 'User', 'Message'],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

export default mongoose.model('Notification', notificationSchema);
