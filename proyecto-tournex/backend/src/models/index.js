import sequelize from '../config/db.js';
import User from './User.js';
import Tournament from './Tournament.js';
import TournamentParticipant from './TournamentParticipant.js';
import Team from './Team.js';
import TeamMember from './TeamMember.js';
import Match from './Match.js';
import Notification from './Notification.js';
import Message from './Message.js';

// Relaciones User
User.hasMany(Tournament, { foreignKey: 'createdById', as: 'tournaments' });
Tournament.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(Team, { foreignKey: 'captainId', as: 'captainedTeams' });
Team.belongsTo(User, { foreignKey: 'captainId', as: 'captain' });

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
TournamentParticipant.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Relaciones Team
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Team.hasMany(Match, { foreignKey: 'team1Id', as: 'matchesAsTeam1' });
Team.hasMany(Match, { foreignKey: 'team2Id', as: 'matchesAsTeam2' });
Team.hasMany(Match, { foreignKey: 'winnerId', as: 'wonMatches' });

// Relaciones Match
Match.belongsTo(Team, { foreignKey: 'team1Id', as: 'team1' });
Match.belongsTo(Team, { foreignKey: 'team2Id', as: 'team2' });
Match.belongsTo(Team, { foreignKey: 'winnerId', as: 'winner' });
Match.belongsTo(User, { foreignKey: 'refereeId', as: 'referee' });

Match.hasMany(Message, { foreignKey: 'matchId', as: 'messages' });
Message.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

export {
  sequelize,
  User,
  Tournament,
  TournamentParticipant,
  Team,
  TeamMember,
  Match,
  Notification,
  Message,
};
