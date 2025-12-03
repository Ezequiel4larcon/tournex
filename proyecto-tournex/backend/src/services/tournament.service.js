import Tournament from '../models/Tournament.js';
import TournamentParticipant from '../models/TournamentParticipant.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';

/**
 * Crear un nuevo torneo
 */
export const createTournament = async (tournamentData, createdBy) => {
  // Validar que maxParticipants sea uno de los valores permitidos
  const validParticipants = [2, 4, 8, 16, 32];
  if (!validParticipants.includes(tournamentData.maxParticipants)) {
    throw { status: 400, message: 'El número máximo de participantes debe ser 2, 4, 8, 16 o 32' };
  }

  // Determinar el status inicial basado en las fechas de inscripción
  const now = new Date();
  const registrationStart = new Date(tournamentData.registrationStartDate);
  const registrationEnd = new Date(tournamentData.registrationEndDate);
  
  let initialStatus = 'pending';
  if (registrationStart <= now && registrationEnd > now) {
    // Si ya empezaron las inscripciones y aún no terminan
    initialStatus = 'registration_open';
  } else if (registrationEnd <= now) {
    // Si ya terminaron las inscripciones
    initialStatus = 'registration_closed';
  }

  // Forzar formato a single_elimination
  const tournament = await Tournament.create({
    ...tournamentData,
    format: 'single_elimination',
    status: initialStatus,
    owner: createdBy,
    createdBy
  });
  
  return tournament;
};

/**
 * Obtener todos los torneos con filtros
 */
export const getAllTournaments = async (filters = {}) => {
  const { status, game, page = 1, limit = 10 } = filters;
  
  const query = {};
  if (status) query.status = status;
  if (game) query.game = new RegExp(game, 'i');

  const skip = (page - 1) * limit;

  const tournaments = await Tournament
    .find(query)
    .populate('createdBy', 'username email')
    .populate('owner', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Obtener participantes para cada torneo
  const tournamentsWithParticipants = await Promise.all(
    tournaments.map(async (tournament) => {
      const participants = await TournamentParticipant
        .find({ tournament: tournament._id })
        .populate('player', 'username email');
      
      return {
        ...tournament.toObject(),
        participants
      };
    })
  );

  const total = await Tournament.countDocuments(query);

  return {
    tournaments: tournamentsWithParticipants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener torneo por ID
 */
export const getTournamentById = async (tournamentId) => {
  const tournament = await Tournament
    .findById(tournamentId)
    .populate('createdBy', 'username email avatar')
    .populate('owner', 'username email avatar')
    .populate({
      path: 'winner',
      populate: {
        path: 'player',
        select: 'username email avatar'
      }
    });

  if (!tournament) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  // Obtener participantes (excluyendo baneados)
  const participants = await TournamentParticipant
    .find({ tournament: tournamentId, status: { $nin: ['rejected', 'banned'] } })
    .populate('player', 'username avatar');

  return {
    ...tournament.toObject(),
    participants
  };
};

/**
 * Actualizar torneo
 */
export const updateTournament = async (tournamentId, updateData, userId) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  // Solo el creador o admin pueden actualizar
  if (tournament.owner.toString() !== userId.toString()) {
    const user = await User.findById(userId);
    if (user.role !== 'super_admin') {
      throw { status: 403, message: 'No estás autorizado para actualizar este torneo' };
    }
  }

  // No permitir ciertos cambios si el torneo ya empezó
  if (tournament.status === 'in_progress' || tournament.status === 'completed') {
    const restrictedFields = [
      'maxParticipants', 
      'format', 
      'registrationStartDate', 
      'registrationEndDate', 
      'startDate', 
      'endDate'
    ];
    const hasRestrictedChange = restrictedFields.some(field => updateData[field] !== undefined);
    if (hasRestrictedChange) {
      throw { status: 400, message: 'No se pueden modificar las fechas ni configuraciones una vez que el torneo está en progreso o completado' };
    }
  }

  Object.assign(tournament, updateData);

  // Auto-actualizar estado basándose en las fechas
  const now = new Date();
  const regStart = new Date(tournament.registrationStartDate);
  const regEnd = new Date(tournament.registrationEndDate);
  const tournamentStart = new Date(tournament.startDate);
  const tournamentEnd = new Date(tournament.endDate);

  // Solo actualizar estado si no está en progreso o completado
  if (tournament.status !== 'in_progress' && tournament.status !== 'completed') {
    if (now < regStart) {
      // Antes del inicio de inscripciones
      tournament.status = 'pending';
    } else if (now >= regStart && now <= regEnd) {
      // Dentro del período de inscripciones
      tournament.status = 'registration_open';
    } else if (now > regEnd && now < tournamentStart) {
      // Inscripciones cerradas, esperando inicio del torneo
      tournament.status = 'registration_closed';
    } else if (now >= tournamentStart && now <= tournamentEnd) {
      // Durante el torneo (solo si no está marcado como in_progress manualmente)
      if (tournament.status === 'pending' || tournament.status === 'registration_open' || tournament.status === 'registration_closed') {
        tournament.status = 'registration_closed'; // No cambiar a in_progress automáticamente
      }
    }
    // No cambiar a completed automáticamente, debe hacerse manualmente
  }

  await tournament.save();

  return tournament;
};

/**
 * Eliminar torneo
 */
export const deleteTournament = async (tournamentId, userId) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  // Verificar si es owner o super admin
  const user = await User.findById(userId);
  const isOwner = tournament.owner.toString() === userId.toString();
  const isSuperAdmin = user.role === 'super_admin';

  if (!isOwner && !isSuperAdmin) {
    throw { status: 403, message: 'No estás autorizado para eliminar este torneo' };
  }

  // Solo super admin puede eliminar torneos en progreso
  if (tournament.status === 'in_progress' && !isSuperAdmin) {
    throw { status: 400, message: 'No se puede eliminar un torneo en progreso. Solo super admin puede hacerlo.' };
  }

  await Tournament.findByIdAndDelete(tournamentId);
  await TournamentParticipant.deleteMany({ tournament: tournamentId });
  await Match.deleteMany({ tournament: tournamentId });

  return { message: 'Torneo eliminado exitosamente' };
};

/**
 * Abrir inscripciones del torneo
 */
export const openRegistration = async (tournamentId, registrationData, userId) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  // Solo el owner o super admin pueden abrir inscripciones
  const user = await User.findById(userId);
  if (tournament.owner.toString() !== userId.toString() && user.role !== 'super_admin') {
    throw { status: 403, message: 'No estás autorizado para modificar este torneo' };
  }

  if (!['pending', 'registration_closed'].includes(tournament.status)) {
    throw { status: 400, message: 'Solo se pueden abrir inscripciones para torneos pendientes o cerrados' };
  }

  // Actualizar fechas de inscripción si se proporcionan
  if (registrationData.registrationStartDate) {
    tournament.registrationStartDate = registrationData.registrationStartDate;
  }
  if (registrationData.registrationEndDate) {
    tournament.registrationEndDate = registrationData.registrationEndDate;
  }

  // Cambiar status a registration_open
  tournament.status = 'registration_open';
  await tournament.save();

  // Emitir evento Socket.IO
  const io = getIO();
  if (io) {
    io.emit('tournament_updated', tournament);
  }

  return tournament;
};

/**
 * Registrar participante (jugador o equipo)
 */
export const registerParticipant = async (tournamentId, participantData) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  if (tournament.status !== 'registration_open') {
    throw { status: 400, message: 'Las inscripciones del torneo no están abiertas' };
  }

  if (tournament.currentParticipants >= tournament.maxParticipants) {
    throw { status: 400, message: 'El torneo está lleno' };
  }

  // Verificar que el jugador no sea el owner del torneo
  if (tournament.owner.toString() === participantData.player.toString()) {
    throw { status: 400, message: 'El creador del torneo no puede registrarse como participante' };
  }

  // Verificar si ya está registrado o fue baneado
  const existingParticipant = await TournamentParticipant.findOne({
    tournament: tournamentId,
    player: participantData.player
  });

  if (existingParticipant) {
    if (existingParticipant.status === 'banned') {
      throw { status: 403, message: 'Has sido baneado de este torneo y no puedes registrarte nuevamente' };
    }
    throw { status: 400, message: 'Ya estás registrado en este torneo' };
  }

  const participant = await TournamentParticipant.create({
    tournament: tournamentId,
    player: participantData.player,
    status: 'registered'
  });

  // Actualizar contador
  tournament.currentParticipants += 1;
  await tournament.save();

  // Emitir evento de Socket.IO
  const io = getIO();
  if (io) {
    io.to(`tournament_${tournamentId}`).emit('participant_joined', {
      tournamentId,
      participant: await TournamentParticipant.findById(participant._id).populate('player', 'username email')
    });
  }

  return participant;
};

/**
 * Generar bracket y asignar árbitros
 */
export const generateBracket = async (tournamentId, userId) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  // Solo owner o super admin pueden generar bracket
  if (tournament.owner.toString() !== userId.toString()) {
    const user = await User.findById(userId);
    if (user.role !== 'super_admin') {
      throw { status: 403, message: 'No estás autorizado para generar el bracket' };
    }
  }

  if (tournament.bracketGenerated) {
    throw { status: 400, message: 'El bracket ya fue generado' };
  }

  if (tournament.currentParticipants < 2) {
    throw { status: 400, message: 'Se necesitan al menos 2 participantes para generar el bracket' };
  }

  // Obtener participantes registrados
  const participants = await TournamentParticipant.find({
    tournament: tournamentId,
    status: 'registered'
  });

  // El creador del torneo será el árbitro de todos los matches
  const tournamentOwner = tournament.owner;

  // Generar matches para la primera ronda
  const matches = [];
  const numParticipants = participants.length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
  const numByes = nextPowerOf2 - numParticipants;

  let matchNumber = 1;

  for (let i = 0; i < numParticipants; i += 2) {
    const participant1 = participants[i];
    const participant2 = i + 1 < numParticipants ? participants[i + 1] : null;

    const match = {
      tournament: tournamentId,
      round: 1,
      matchNumber: matchNumber++,
      participant1: participant1._id,
      participant2: participant2 ? participant2._id : null,
      isBye: !participant2,
      status: !participant2 ? 'completed' : 'pending',
      winner: !participant2 ? participant1._id : null,
      assignedReferee: tournamentOwner
    };

    matches.push(match);
  }

  await Match.insertMany(matches);

  // Marcar bracket como generado
  tournament.bracketGenerated = true;
  tournament.status = 'in_progress';
  await tournament.save();

  return {
    message: 'Bracket generado exitosamente',
    matchesCreated: matches.length
  };
};

/**
 * Obtener matches de un torneo
 */
export const getTournamentMatches = async (tournamentId, round = null) => {
  const query = { tournament: tournamentId };
  if (round) query.round = parseInt(round);

  const matches = await Match
    .find(query)
    .populate({
      path: 'participant1',
      populate: { path: 'player', select: 'username avatar' }
    })
    .populate({
      path: 'participant2',
      populate: { path: 'player', select: 'username avatar' }
    })
    .populate('winner')
    .sort({ round: 1, matchNumber: 1 });

  return matches;
};

/**
 * Banear a un participante de un torneo
 */
export const banParticipant = async (tournamentId, participantId, userId) => {
  // Verificar que el torneo existe
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw { status: 404, message: 'Torneo no encontrado' };
  }

  // Verificar que el usuario es el owner del torneo o super admin
  const user = await User.findById(userId);
  const isOwner = tournament.owner.toString() === userId.toString();
  const isSuperAdmin = user.role === 'super_admin';
  
  if (!isOwner && !isSuperAdmin) {
    throw { status: 403, message: 'Solo el creador del torneo o super admin pueden banear participantes' };
  }

  // Solo se puede banear en estados específicos
  const allowedStatuses = ['registration_open', 'in_progress'];
  if (!allowedStatuses.includes(tournament.status)) {
    throw { status: 400, message: 'Solo se pueden banear participantes cuando el torneo está en inscripción o en progreso' };
  }

  // Verificar que el participante existe
  const participant = await TournamentParticipant.findById(participantId).populate('player', 'username email');
  if (!participant) {
    throw { status: 404, message: 'Participante no encontrado' };
  }

  // Verificar que el participante pertenece a este torneo
  if (participant.tournament.toString() !== tournamentId.toString()) {
    throw { status: 400, message: 'El participante no pertenece a este torneo' };
  }

  // No se puede banear si ya está baneado
  if (participant.status === 'banned') {
    throw { status: 400, message: 'El participante ya está baneado' };
  }

  // Si el torneo está en progreso, verificar que el participante no esté en un match activo
  if (tournament.status === 'in_progress') {
    const activeMatch = await Match.findOne({
      tournament: tournamentId,
      $or: [
        { participant1: participantId },
        { participant2: participantId }
      ],
      status: { $in: ['pending', 'in_progress'] }
    });

    if (activeMatch) {
      throw { status: 400, message: 'No se puede banear a un participante con partidos activos o pendientes' };
    }
  }

  // Banear al participante
  participant.status = 'banned';
  await participant.save();

  // Decrementar currentParticipants (el jugador baneado no cuenta como participante)
  await Tournament.findByIdAndUpdate(tournamentId, {
    $inc: { currentParticipants: -1 }
  });

  // Emitir evento de socket
  const io = getIO();
  if (io) {
    io.to(`tournament_${tournamentId}`).emit('participant_banned', {
      tournamentId,
      participant: {
        _id: participant._id,
        player: participant.player,
        status: participant.status
      }
    });
  }

  return participant;
};
