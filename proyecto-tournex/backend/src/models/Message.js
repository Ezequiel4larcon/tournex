import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  contextType: {
    type: String,
    enum: ['tournament', 'match', 'team'],
    required: true
  },
  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contextModel'
  },
  contextModel: {
    type: String,
    enum: ['Tournament', 'Match', 'Team'],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
messageSchema.index({ contextType: 1, contextId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export default mongoose.model('Message', messageSchema);
