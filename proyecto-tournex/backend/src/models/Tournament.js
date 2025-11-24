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
    enum: ['single_elimination'],
    default: 'single_elimination'
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Max participants is required'],
    enum: [2, 4, 8, 16, 32],
    validate: {
      validator: function(v) {
        return [2, 4, 8, 16, 32].includes(v);
      },
      message: 'Max participants must be 2, 4, 8, 16, or 32'
    }
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
  // Convertir a Date para comparar correctamente
  const regStart = this.registrationStartDate ? new Date(this.registrationStartDate) : null;
  const regEnd = this.registrationEndDate ? new Date(this.registrationEndDate) : null;
  const start = this.startDate ? new Date(this.startDate) : null;
  const end = this.endDate ? new Date(this.endDate) : null;

  if (start && regEnd && start <= regEnd) {
    this.invalidate('startDate', 'Start date must be after registration end date');
  }
  if (regStart && regEnd && regEnd <= regStart) {
    this.invalidate('registrationEndDate', 'Registration end date must be after registration start date');
  }
  if (start && end && end <= start) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

export default mongoose.model('Tournament', tournamentSchema);
