import Match from '../models/Match.js';
import MatchReport from '../models/MatchReport.js';
import Evidence from '../models/Evidence.js';
import Tournament from '../models/Tournament.js';
import TournamentParticipant from '../models/TournamentParticipant.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Obtener matches asignados a un árbitro
 */
export const getAssignedMatches = async (refereeId) => {
  const matches = await Match
    .find({ assignedReferee: refereeId, status: { $in: ['pending', 'in_progress'] } })
    .populate('tournament', 'name game')
    .populate({
      path: 'participant1',
      populate: [
        { path: 'player', select: 'username avatar' },
        { path: 'team', select: 'name logo' }
      ]
    })
    .populate({
      path: 'participant2',
      populate: [
        { path: 'player', select: 'username avatar' },
        { path: 'team', select: 'name logo' }
      ]
    })
    .sort({ scheduledTime: 1, round: 1 });

  return matches;
};

/**
 * Reportar resultado de un match (CRÍTICA - HU-008)
 */
export const reportMatchResult = async (matchId, reportData, userId) => {
  let match = await Match.findById(matchId)
    .populate('tournament')
    .populate('participant1')
    .populate('participant2');

  if (!match) {
    throw { status: 404, message: 'Match not found' };
  }

  // Verificar que sea el creador del torneo o el árbitro asignado
  const tournament = await Tournament.findById(match.tournament._id);
  const isOwner = tournament.owner.toString() === userId.toString();
  const isAssignedReferee = match.assignedReferee && match.assignedReferee.toString() === userId.toString();
  
  if (!isOwner && !isAssignedReferee) {
    throw { status: 403, message: 'You are not authorized to report this match' };
  }

  if (match.status === 'completed') {
    throw { status: 400, message: 'Match already completed' };
  }

  if (!match.participant1 || !match.participant2) {
    throw { status: 400, message: 'Match does not have both participants' };
  }

  // Validar ganador
  const { winnerId, score, notes } = reportData;
  
  if (winnerId !== match.participant1._id.toString() && winnerId !== match.participant2._id.toString()) {
    throw { status: 400, message: 'Invalid winner' };
  }

  // Iniciar transacción (simulada con operaciones secuenciales)
  try {
    // 1. Crear match report
    const report = await MatchReport.create({
      match: matchId,
      reportedBy: userId,
      winner: winnerId,
      score: {
        participant1Score: score.participant1Score,
        participant2Score: score.participant2Score
      },
      notes,
      validated: true, // Auto-validar si es el creador del torneo o árbitro asignado
      validatedBy: userId,
      validatedAt: new Date()
    });

    // 2. Actualizar match
    await Match.findByIdAndUpdate(matchId, {
      status: 'completed',
      winner: winnerId,
      score: score,
      completedAt: new Date()
    });

    // Recargar el match actualizado
    match = await Match.findById(matchId)
      .populate('tournament')
      .populate('participant1')
      .populate('participant2');

    // 3. Actualizar participant status
    await TournamentParticipant.findByIdAndUpdate(
      winnerId,
      { status: 'checked_in' }
    );

    const loserId = winnerId === match.participant1._id.toString() 
      ? match.participant2._id 
      : match.participant1._id;
    
    await TournamentParticipant.findByIdAndUpdate(
      loserId,
      { status: 'eliminated' }
    );

    // 4. Avanzar bracket y generar siguiente ronda si es necesario
    if (match.nextMatch) {
      const nextMatch = await Match.findById(match.nextMatch);
      if (nextMatch) {
        if (!nextMatch.participant1) {
          nextMatch.participant1 = winnerId;
        } else if (!nextMatch.participant2) {
          nextMatch.participant2 = winnerId;
        }
        await nextMatch.save();
      }
    } else {
      // Verificar si todos los matches de la ronda actual están completos
      const currentRoundMatches = await Match.find({
        tournament: match.tournament._id,
        round: match.round
      });

      const allCompleted = currentRoundMatches.every(m => m.status === 'completed');

      if (allCompleted) {
        // Obtener ganadores de la ronda actual
        const winners = currentRoundMatches
          .filter(m => m.winner)
          .map(m => m.winner);

        console.log('Ronda completada. Ganadores:', winners.length);

        // Si hay más de 1 ganador, crear siguiente ronda
        if (winners.length > 1) {
          await generateNextRound(match.tournament._id, match.round + 1, winners);
        } else if (winners.length === 1) {
          // Solo queda un ganador, marcar como campeón y finalizar torneo
          console.log('¡Torneo completado! Ganador:', winners[0]);
          await TournamentParticipant.findByIdAndUpdate(
            winners[0],
            { status: 'winner' }
          );
          await Tournament.findByIdAndUpdate(
            match.tournament._id,
            { 
              status: 'completed',
              winner: winners[0]
            }
          );
        }
      }
    }

    // 5. Notificar a los participantes
    const participant1 = match.participant1;
    const participant2 = match.participant2;

    const winnerId_str = winnerId.toString();
    const winnerParticipant = winnerId_str === participant1._id.toString() ? participant1 : participant2;
    const loserParticipant = winnerId_str === participant1._id.toString() ? participant2 : participant1;

    // Notificar al ganador
    const winnerUserId = winnerParticipant.player || winnerParticipant.team;
    if (winnerParticipant.player) {
      await Notification.create({
        recipient: winnerParticipant.player,
        type: 'match_reported',
        title: 'Match Result Reported',
        message: `You won your match in ${match.tournament.name}!`,
        relatedEntity: {
          entityType: 'Match',
          entityId: matchId
        }
      });
    }

    // Notificar al perdedor
    if (loserParticipant.player) {
      await Notification.create({
        recipient: loserParticipant.player,
        type: 'match_reported',
        title: 'Match Result Reported',
        message: `Your match in ${match.tournament.name} has been reported.`,
        relatedEntity: {
          entityType: 'Match',
          entityId: matchId
        }
      });
    }

    return {
      match,
      report
    };
  } catch (error) {
    throw { status: 500, message: 'Error reporting match result', details: error.message };
  }
};

/**
 * Validar o editar un report (HU-009)
 */
export const validateReport = async (matchId, validationData, userId) => {
  const user = await User.findById(userId);
  const match = await Match.findById(matchId).populate('assignedReferee');

  if (!match) {
    throw { status: 404, message: 'Match not found' };
  }

  // Solo admin o árbitro asignado pueden validar
  const isAdmin = user.role === 'admin';
  const isAssignedReferee = match.assignedReferee && match.assignedReferee._id.toString() === userId.toString();

  if (!isAdmin && !isAssignedReferee) {
    throw { status: 403, message: 'Not authorized to validate this report' };
  }

  const report = await MatchReport.findOne({ match: matchId }).sort({ createdAt: -1 });

  if (!report) {
    throw { status: 404, message: 'No report found for this match' };
  }

  // Actualizar report
  if (validationData.validated !== undefined) {
    report.validated = validationData.validated;
    report.validatedBy = userId;
    report.validatedAt = new Date();
  }

  if (validationData.disputed) {
    report.disputed = true;
    report.disputeReason = validationData.disputeReason;
    match.status = 'disputed';
    await match.save();
  }

  // Admin puede editar score/winner
  if (isAdmin && validationData.score) {
    report.score = validationData.score;
    match.score = validationData.score;
  }

  if (isAdmin && validationData.winner) {
    report.winner = validationData.winner;
    match.winner = validationData.winner;
    await match.save();
  }

  await report.save();

  return report;
};

/**
 * Subir evidencia
 */
export const uploadEvidence = async (matchId, evidenceData, userId) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw { status: 404, message: 'Match not found' };
  }

  // Solo el árbitro asignado puede subir evidencias
  if (!match.assignedReferee || match.assignedReferee.toString() !== userId.toString()) {
    throw { status: 403, message: 'Only assigned referee can upload evidence' };
  }

  const evidence = await Evidence.create({
    match: matchId,
    uploadedBy: userId,
    ...evidenceData
  });

  return evidence;
};

/**
 * Obtener evidencias de un match
 */
export const getMatchEvidences = async (matchId) => {
  const evidences = await Evidence
    .find({ match: matchId })
    .populate('uploadedBy', 'username email')
    .sort({ createdAt: -1 });

  return evidences;
};

/**
 * Reasignar árbitro (HU-014)
 */
export const reassignReferee = async (matchId, newRefereeId, adminId) => {
  const admin = await User.findById(adminId);
  if (admin.role !== 'admin') {
    throw { status: 403, message: 'Only admins can reassign referees' };
  }

  const match = await Match.findById(matchId);
  if (!match) {
    throw { status: 404, message: 'Match not found' };
  }

  const newReferee = await User.findById(newRefereeId);
  if (!newReferee || newReferee.role !== 'referee') {
    throw { status: 400, message: 'Invalid referee' };
  }

  const oldRefereeId = match.assignedReferee;
  match.assignedReferee = newRefereeId;

  // Si ya había un report, marcarlo como disputed
  if (match.status === 'completed') {
    const report = await MatchReport.findOne({ match: matchId });
    if (report) {
      report.disputed = true;
      report.disputeReason = 'Referee reassignment';
      await report.save();
    }
    match.status = 'disputed';
  }

  await match.save();

  // Notificar al nuevo árbitro
  await Notification.create({
    recipient: newRefereeId,
    type: 'match_assigned',
    title: 'Match Assigned',
    message: `You have been assigned to a match`,
    relatedEntity: {
      entityType: 'Match',
      entityId: matchId
    }
  });

  // Notificar al antiguo árbitro si había uno
  if (oldRefereeId) {
    await Notification.create({
      recipient: oldRefereeId,
      type: 'referee_reassigned',
      title: 'Match Reassigned',
      message: `You have been removed from a match assignment`,
      relatedEntity: {
        entityType: 'Match',
        entityId: matchId
      }
    });
  }

  return match;
};

/**
 * Obtener match por ID con detalles completos
 */
export const getMatchById = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('tournament', 'name game')
    .populate({
      path: 'participant1',
      populate: [
        { path: 'player', select: 'username avatar' },
        { path: 'team', select: 'name logo captain', populate: { path: 'captain', select: 'username' } }
      ]
    })
    .populate({
      path: 'participant2',
      populate: [
        { path: 'player', select: 'username avatar' },
        { path: 'team', select: 'name logo captain', populate: { path: 'captain', select: 'username' } }
      ]
    })
    .populate('winner')
    .populate('assignedReferee', 'username email avatar');

  if (!match) {
    throw { status: 404, message: 'Match not found' };
  }

  // Obtener report si existe
  const report = await MatchReport.findOne({ match: matchId })
    .populate('reportedBy', 'username')
    .populate('validatedBy', 'username');

  // Obtener evidencias
  const evidences = await Evidence.find({ match: matchId })
    .populate('uploadedBy', 'username');

  return {
    match,
    report,
    evidences
  };
};

/**
 * Generar siguiente ronda del torneo
 */
const generateNextRound = async (tournamentId, roundNumber, winners) => {
  const tournament = await Tournament.findById(tournamentId);
  
  if (!tournament) {
    throw { status: 404, message: 'Tournament not found' };
  }

  const matches = [];
  let matchNumber = 1;

  // Emparejar ganadores para la siguiente ronda
  for (let i = 0; i < winners.length; i += 2) {
    const participant1 = winners[i];
    const participant2 = i + 1 < winners.length ? winners[i + 1] : null;

    const match = {
      tournament: tournamentId,
      round: roundNumber,
      matchNumber: matchNumber++,
      participant1: participant1,
      participant2: participant2,
      isBye: !participant2,
      status: !participant2 ? 'completed' : 'pending',
      winner: !participant2 ? participant1 : null,
      // El creador del torneo es el árbitro
      assignedReferee: tournament.owner
    };

    matches.push(match);
  }

  if (matches.length > 0) {
    await Match.insertMany(matches);
  }

  return matches;
};
