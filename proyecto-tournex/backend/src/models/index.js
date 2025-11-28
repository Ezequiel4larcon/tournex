import sequelize from '../config/db.js';
import User from './User.js';
import Tournament from './Tournament.js';
import TournamentParticipant from './TournamentParticipant.js';
import Match from './Match.js';
import Notification from './Notification.js';

// Relaciones User
User.hasMany(Tournament, { foreignKey: 'createdById', as: 'tournaments' });
Tournament.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relaciones Tournament
Tournament.hasMany(TournamentParticipant, { foreignKey: 'tournamentId', as: 'participants' });
TournamentParticipant.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

Tournament.hasMany(Match, { foreignKey: 'tournamentId', as: 'matches' });
Match.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

// Relaciones TournamentParticipant
TournamentParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relaciones Match
Match.belongsTo(User, { foreignKey: 'refereeId', as: 'referee' });

export {
  sequelize,
  User,
  Tournament,
  TournamentParticipant,
  Match,
  Notification,
};
