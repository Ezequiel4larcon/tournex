import sequelize from '../config/db.js';
import User from './User.js';
import Tournament from './Tournament.js';
import TournamentParticipant from './TournamentParticipant.js';
import Match from './Match.js';
import Notification from './Notification.js';
import Message from './Message.js';

// Relaciones User
User.hasMany(Tournament, { foreignKey: 'createdById', as: 'tournaments' });
Tournament.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Relaciones Tournament
Tournament.hasMany(TournamentParticipant, { foreignKey: 'tournamentId', as: 'participants' });
TournamentParticipant.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

Tournament.hasMany(Match, { foreignKey: 'tournamentId', as: 'matches' });
Match.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

Tournament.hasMany(Message, { foreignKey: 'tournamentId', as: 'messages' });
Message.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

// Relaciones TournamentParticipant
TournamentParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relaciones Match
Match.belongsTo(User, { foreignKey: 'refereeId', as: 'referee' });

Match.hasMany(Message, { foreignKey: 'matchId', as: 'messages' });
Message.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

export {
  sequelize,
  User,
  Tournament,
  TournamentParticipant,
  Match,
  Notification,
  Message,
};
