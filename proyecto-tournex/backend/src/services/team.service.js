import Team from '../models/Team.js';
import TeamMembershipRequest from '../models/TeamMembershipRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Crear un equipo
 */
export const createTeam = async (teamData, captainId) => {
  // Verificar que el usuario no esté en otro equipo
  const captain = await User.findById(captainId);
  if (captain.currentTeam) {
    throw { status: 400, message: 'You are already in a team. Leave your current team first.' };
  }

  // Verificar nombre único
  const existingTeam = await Team.findOne({ name: teamData.name });
  if (existingTeam) {
    throw { status: 400, message: 'Team name already exists' };
  }

  const team = await Team.create({
    ...teamData,
    captain: captainId,
    members: [] // Capitán no está en members array
  });

  // Actualizar usuario
  captain.currentTeam = team._id;
  await captain.save();

  // Crear notificación
  await Notification.create({
    recipient: captainId,
    type: 'team_invitation',
    title: 'Team Created',
    message: `Your team "${team.name}" has been created successfully!`,
    relatedEntity: {
      entityType: 'Team',
      entityId: team._id
    }
  });

  return team;
};

/**
 * Obtener todos los equipos
 */
export const getAllTeams = async (filters = {}) => {
  const { search, page = 1, limit = 10 } = filters;
  
  const query = { isActive: true };
  if (search) {
    query.name = new RegExp(search, 'i');
  }

  const skip = (page - 1) * limit;

  const teams = await Team
    .find(query)
    .populate('captain', 'username email avatar')
    .populate('members.user', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Team.countDocuments(query);

  return {
    teams,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener equipo por ID
 */
export const getTeamById = async (teamId) => {
  const team = await Team
    .findById(teamId)
    .populate('captain', 'username email avatar')
    .populate('members.user', 'username email avatar');

  if (!team) {
    throw { status: 404, message: 'Team not found' };
  }

  return team;
};

/**
 * Actualizar equipo (solo capitán)
 */
export const updateTeam = async (teamId, updateData, userId) => {
  const team = await Team.findById(teamId);

  if (!team) {
    throw { status: 404, message: 'Team not found' };
  }

  if (team.captain.toString() !== userId.toString()) {
    throw { status: 403, message: 'Only team captain can update team' };
  }

  // No permitir cambiar capitán directamente
  delete updateData.captain;
  delete updateData.members;

  Object.assign(team, updateData);
  await team.save();

  return team;
};

/**
 * Eliminar equipo (solo capitán)
 */
export const deleteTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);

  if (!team) {
    throw { status: 404, message: 'Team not found' };
  }

  if (team.captain.toString() !== userId.toString()) {
    throw { status: 403, message: 'Only team captain can delete team' };
  }

  // Actualizar usuarios
  await User.updateMany(
    { currentTeam: teamId },
    { $set: { currentTeam: null } }
  );

  // Eliminar solicitudes pendientes
  await TeamMembershipRequest.deleteMany({ team: teamId });

  await Team.findByIdAndDelete(teamId);

  return { message: 'Team deleted successfully' };
};

/**
 * Solicitar unirse a un equipo
 */
export const requestJoinTeam = async (teamId, playerId, message) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw { status: 404, message: 'Team not found' };
  }

  const player = await User.findById(playerId);
  if (player.currentTeam) {
    throw { status: 400, message: 'You are already in a team' };
  }

  // Verificar si ya hay una solicitud pendiente
  const existingRequest = await TeamMembershipRequest.findOne({
    team: teamId,
    player: playerId,
    status: 'pending'
  });

  if (existingRequest) {
    throw { status: 400, message: 'You already have a pending request to this team' };
  }

  const request = await TeamMembershipRequest.create({
    team: teamId,
    player: playerId,
    message
  });

  // Notificar al capitán
  await Notification.create({
    recipient: team.captain,
    type: 'team_invitation',
    title: 'New Team Join Request',
    message: `${player.username} wants to join ${team.name}`,
    relatedEntity: {
      entityType: 'Team',
      entityId: teamId
    }
  });

  return request;
};

/**
 * Obtener solicitudes de un equipo (solo capitán)
 */
export const getTeamRequests = async (teamId, userId) => {
  const team = await Team.findById(teamId);

  if (!team) {
    throw { status: 404, message: 'Team not found' };
  }

  if (team.captain.toString() !== userId.toString()) {
    throw { status: 403, message: 'Only team captain can view requests' };
  }

  const requests = await TeamMembershipRequest
    .find({ team: teamId, status: 'pending' })
    .populate('player', 'username email avatar')
    .sort({ createdAt: -1 });

  return requests;
};

/**
 * Aceptar o rechazar solicitud (solo capitán)
 */
export const respondToRequest = async (requestId, action, userId) => {
  const request = await TeamMembershipRequest
    .findById(requestId)
    .populate('team')
    .populate('player');

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  const team = request.team;

  if (team.captain.toString() !== userId.toString()) {
    throw { status: 403, message: 'Only team captain can respond to requests' };
  }

  if (request.status !== 'pending') {
    throw { status: 400, message: 'Request already processed' };
  }

  request.status = action;
  request.reviewedBy = userId;
  request.reviewedAt = new Date();
  await request.save();

  if (action === 'accepted') {
    // Agregar al equipo
    team.members.push({
      user: request.player._id,
      joinedAt: new Date()
    });
    await team.save();

    // Actualizar usuario
    const player = await User.findById(request.player._id);
    player.currentTeam = team._id;
    await player.save();

    // Notificar al jugador
    await Notification.create({
      recipient: request.player._id,
      type: 'team_request_accepted',
      title: 'Team Request Accepted',
      message: `You have been accepted into ${team.name}!`,
      relatedEntity: {
        entityType: 'Team',
        entityId: team._id
      }
    });
  } else {
    // Notificar rechazo
    await Notification.create({
      recipient: request.player._id,
      type: 'team_request_rejected',
      title: 'Team Request Rejected',
      message: `Your request to join ${team.name} was rejected.`,
      relatedEntity: {
        entityType: 'Team',
        entityId: team._id
      }
    });
  }

  return request;
};

/**
 * Expulsar jugador del equipo (solo capitán)
 */
export const kickMember = async (teamId, memberId, userId) => {
  const team = await Team.findById(teamId);

  if (!team) {
    throw { status: 404, message: 'Team not found' };
  }

  if (team.captain.toString() !== userId.toString()) {
    throw { status: 403, message: 'Only team captain can kick members' };
  }

  if (team.captain.toString() === memberId.toString()) {
    throw { status: 400, message: 'Cannot kick the team captain' };
  }

  // Verificar que el miembro esté en el equipo
  const memberIndex = team.members.findIndex(
    m => m.user.toString() === memberId.toString()
  );

  if (memberIndex === -1) {
    throw { status: 404, message: 'Member not found in team' };
  }

  // Remover del equipo
  team.members.splice(memberIndex, 1);
  await team.save();

  // Actualizar usuario
  await User.findByIdAndUpdate(memberId, { currentTeam: null });

  // Notificar al jugador
  await Notification.create({
    recipient: memberId,
    type: 'team_kicked',
    title: 'Removed from Team',
    message: `You have been removed from ${team.name}`,
    relatedEntity: {
      entityType: 'Team',
      entityId: team._id
    }
  });

  return { message: 'Member kicked successfully' };
};

/**
 * Abandonar equipo
 */
export const leaveTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);

  if (!team) {
    throw { status: 404, message: 'Team not found' };
  }

  // El capitán no puede abandonar, debe transferir o eliminar el equipo
  if (team.captain.toString() === userId.toString()) {
    throw { status: 400, message: 'Captain cannot leave. Transfer captaincy or delete team.' };
  }

  // Remover del equipo
  const memberIndex = team.members.findIndex(
    m => m.user.toString() === userId.toString()
  );

  if (memberIndex === -1) {
    throw { status: 404, message: 'You are not a member of this team' };
  }

  team.members.splice(memberIndex, 1);
  await team.save();

  // Actualizar usuario
  await User.findByIdAndUpdate(userId, { currentTeam: null });

  return { message: 'Left team successfully' };
};
