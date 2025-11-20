import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Índices
evidenceSchema.index({ match: 1 });
evidenceSchema.index({ uploadedBy: 1 });

export default mongoose.model('Evidence', evidenceSchema);
