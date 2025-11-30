import Match from '../models/Match.js';
import MatchReport from '../models/MatchReport.js';
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

  // Validar ganador y puntajes
  const { winnerId, score, notes } = reportData;
  
  if (winnerId !== match.participant1._id.toString() && winnerId !== match.participant2._id.toString()) {
    throw { status: 400, message: 'Invalid winner' };
  }

  // Validar que el ganador tenga más puntos que el perdedor
  const participant1Score = score.participant1Score || 0;
  const participant2Score = score.participant2Score || 0;
  
  if (participant1Score === participant2Score) {
    throw { status: 400, message: 'Los puntajes no pueden ser iguales. Debe haber un ganador.' };
  }

  const isParticipant1Winner = winnerId === match.participant1._id.toString();
  const winnerScore = isParticipant1Winner ? participant1Score : participant2Score;
  const loserScore = isParticipant1Winner ? participant2Score : participant1Score;

  if (winnerScore <= loserScore) {
    throw { status: 400, message: 'El ganador debe tener más puntos que el perdedor' };
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
 * Obtener match por ID con detalles completos
 */
export const getMatchById = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('tournament', 'name game')
    .populate({
      path: 'participant1',
      populate: [
        { path: 'player', select: 'username avatar' }
      ]
    })
    .populate({
      path: 'participant2',
      populate: [
        { path: 'player', select: 'username avatar' }
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

  return {
    match,
    report
  };
};

/**
 * Cambiar estado de un match a "en vivo"
 */
export const setMatchLive = async (matchId, userId) => {
  const user = await User.findById(userId);
  const match = await Match.findById(matchId)
    .populate({
      path: 'tournament',
      populate: { path: 'owner' }
    })
    .populate('participant1')
    .populate('participant2');

  if (!match) {
    throw { status: 404, message: 'Match not found' };
  }

  if (!match.tournament) {
    throw { status: 404, message: 'Tournament not found for this match' };
  }

  // Solo owner del torneo o super_admin pueden cambiar estado
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  
  // Normalizar el owner ID (puede venir como objeto o string)
  const tournamentOwnerId = match.tournament.owner?._id 
    ? match.tournament.owner._id.toString() 
    : match.tournament.owner.toString();
  
  const isTournamentOwner = tournamentOwnerId === userId.toString();

  if (!isAdmin && !isTournamentOwner) {
    throw { status: 403, message: 'Not authorized to modify this match' };
  }

  // Cambiar estado a "en vivo"
  match.status = 'in_progress';
  await match.save();

  return match;
};

/**
 * Editar resultado de un match (solo owner o super_admin)
 */
export const editMatchResult = async (matchId, editData, userId) => {
  const user = await User.findById(userId);
  const match = await Match.findById(matchId)
    .populate({
      path: 'tournament',
      populate: { path: 'owner' }
    })
    .populate('participant1')
    .populate('participant2');

  if (!match) {
    throw { status: 404, message: 'Match not found' };
  }

  if (!match.tournament) {
    throw { status: 404, message: 'Tournament not found for this match' };
  }

  // No se puede editar si el torneo está completado
  if (match.tournament.status === 'completed') {
    throw { status: 400, message: 'No se pueden editar matches de un torneo finalizado' };
  }

  // No se puede editar un match que fue decidido por BYE
  if (match.isBye) {
    throw { status: 400, message: 'No se pueden editar matches decididos por BYE (sin oponente)' };
  }

  // Solo owner del torneo o super_admin pueden editar
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  
  // Normalizar el owner ID (puede venir como objeto o string)
  const tournamentOwnerId = match.tournament.owner?._id 
    ? match.tournament.owner._id.toString() 
    : match.tournament.owner.toString();
  
  const isTournamentOwner = tournamentOwnerId === userId.toString();

  if (!isAdmin && !isTournamentOwner) {
    throw { status: 403, message: 'Not authorized to edit this match' };
  }

  // Verificar que el match esté reportado
  if (match.status !== 'in_progress' && match.status !== 'completed') {
    throw { status: 400, message: 'Solo se pueden editar matches que han sido reportados' };
  }

  // Verificar si todos los partidos de la ronda actual están completados
  // y si existe algún partido de la siguiente ronda (aunque esté pending)
  const currentRoundMatches = await Match.find({
    tournament: match.tournament._id,
    round: match.round
  });

  const allCurrentRoundCompleted = currentRoundMatches.every(m => m.status === 'completed');
  
  // Buscar si existen partidos de la siguiente ronda
  const nextRoundMatches = await Match.find({
    tournament: match.tournament._id,
    round: match.round + 1
  });

  // Si todos los partidos de esta ronda están completados Y existe la siguiente ronda, no se puede editar
  if (allCurrentRoundCompleted && nextRoundMatches.length > 0) {
    throw { status: 400, message: 'No se puede editar: la ronda ya finalizó y se generó la siguiente fase' };
  }

  const { winnerId, score, notes } = editData;

  // Validar el ganador
  if (winnerId !== match.participant1._id.toString() && 
      winnerId !== match.participant2._id.toString()) {
    throw { status: 400, message: 'El ganador debe ser uno de los participantes del match' };
  }

  // Validar scores
  const isParticipant1Winner = winnerId === match.participant1._id.toString();
  const winnerScore = isParticipant1Winner ? score.participant1Score : score.participant2Score;
  const loserScore = isParticipant1Winner ? score.participant2Score : score.participant1Score;

  if (winnerScore <= loserScore) {
    throw { status: 400, message: 'El ganador debe tener más puntos que el perdedor' };
  }

  // Si hay cambio de ganador, actualizar participantes
  const oldWinnerId = match.winner.toString();
  if (oldWinnerId !== winnerId) {
    // Revertir estado del antiguo ganador
    await TournamentParticipant.findByIdAndUpdate(
      oldWinnerId,
      { status: 'eliminated' }
    );

    // Actualizar nuevo ganador
    await TournamentParticipant.findByIdAndUpdate(
      winnerId,
      { status: 'checked_in' }
    );

    // Actualizar nextMatch si existe
    if (match.nextMatch) {
      const nextMatch = await Match.findById(match.nextMatch);
      if (nextMatch) {
        if (nextMatch.participant1 && nextMatch.participant1.toString() === oldWinnerId) {
          nextMatch.participant1 = winnerId;
        } else if (nextMatch.participant2 && nextMatch.participant2.toString() === oldWinnerId) {
          nextMatch.participant2 = winnerId;
        }
        await nextMatch.save();
      }
    }
  }

  // Actualizar match
  match.winner = winnerId;
  match.score = score;
  match.notes = notes || match.notes;
  await match.save();

  // Actualizar report
  const report = await MatchReport.findOne({ match: matchId }).sort({ createdAt: -1 });
  if (report) {
    report.winner = winnerId;
    report.score = score;
    report.notes = notes || report.notes;
    await report.save();
  }

  return {
    match: await Match.findById(matchId)
      .populate('tournament')
      .populate('participant1')
      .populate('participant2'),
    report
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
