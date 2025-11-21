import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true,
    maxlength: [100, 'Tournament name cannot exceed 100 characters']
  },
  game: {
    type: String,
    required: [true, 'Game name is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  format: {
    type: String,
    enum: ['single_elimination', 'double_elimination', 'round_robin', 'swiss'],
    default: 'single_elimination'
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Max participants is required'],
    min: [2, 'Minimum 2 participants required']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  registrationStartDate: {
    type: Date,
    required: true
  },
  registrationEndDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  prize: {
    type: String,
    default: null
  },
  rules: {
    type: String,
    maxlength: [5000, 'Rules cannot exceed 5000 characters']
  },
  bracketGenerated: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // El creador es el owner/moderador del torneo
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ createdBy: 1 });

// Validación: startDate debe ser después de registrationEndDate
tournamentSchema.pre('validate', function(next) {
  if (this.startDate <= this.registrationEndDate) {
    this.invalidate('startDate', 'Start date must be after registration end date');
  }
  if (this.registrationEndDate <= this.registrationStartDate) {
    this.invalidate('registrationEndDate', 'Registration end date must be after registration start date');
  }
  if (this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

export default mongoose.model('Tournament', tournamentSchema);
