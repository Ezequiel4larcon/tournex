import * as matchService from '../services/match.service.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { emitMatchReported } from '../config/socket.js';
import Match from '../models/Match.js';
import Tournament from '../models/Tournament.js';
import TournamentParticipant from '../models/TournamentParticipant.js';

/**
 * @route   GET /api/matches/assigned
 * @desc    Obtener matches asignados al árbitro
 * @access  Referee
 */
export const getAssignedMatches = asyncHandler(async (req, res) => {
  const matches = await matchService.getAssignedMatches(req.user._id);
  
  res.status(200).json({
    success: true,
    data: matches
  });
});

/**
 * @route   GET /api/matches/:id
 * @desc    Obtener match por ID con detalles
 * @access  Public
 */
export const getMatchById = asyncHandler(async (req, res) => {
  const result = await matchService.getMatchById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   POST /api/matches/:id/validate-result
 * @desc    Validar resultado de un match (owner del torneo o super admin)
 * @access  Private (Tournament Owner or Super Admin)
 */
export const validateMatchResult = asyncHandler(async (req, res) => {
  const { winnerId, score, notes } = req.body;
  const matchId = req.params.id;

  // Buscar el match
  const match = await Match.findById(matchId)
    .populate('tournament')
    .populate({
      path: 'participant1',
      populate: { path: 'player', select: 'username email' }
    })
    .populate({
      path: 'participant2',
      populate: { path: 'player', select: 'username email' }
    });

  if (!match) {
    res.status(404);
    throw new Error('Match no encontrado');
  }

  // Verificar que el match esté pendiente o en progreso
  if (match.status === 'completed') {
    res.status(400);
    throw new Error('Este match ya fue completado');
  }

  // Verificar que ambos participantes existen
  if (!match.participant1 || !match.participant2) {
    res.status(400);
    throw new Error('Match incompleto, faltan participantes');
  }

  // Verificar que el winnerId sea válido
  const winnerParticipant = await TournamentParticipant.findById(winnerId);
  if (!winnerParticipant) {
    res.status(400);
    throw new Error('Participante ganador no válido');
  }

  // Verificar que el ganador sea uno de los participantes del match
  if (
    winnerId !== match.participant1._id.toString() &&
    winnerId !== match.participant2._id.toString()
  ) {
    res.status(400);
    throw new Error('El ganador debe ser uno de los participantes del match');
  }

  // Actualizar el match
  match.winner = winnerId;
  match.score = score;
  match.notes = notes || null;
  match.status = 'completed';
  match.completedAt = new Date();
  match.validatedBy = req.user._id;
  match.validatedAt = new Date();

  await match.save();

  // Actualizar estadísticas de participantes
  const loserId = winnerId === match.participant1._id.toString() 
    ? match.participant2._id 
    : match.participant1._id;

  await TournamentParticipant.findByIdAndUpdate(winnerId, {
    $inc: { wins: 1 }
  });

  await TournamentParticipant.findByIdAndUpdate(loserId, {
    $inc: { losses: 1 },
    status: 'eliminated'
  });

  // Actualizar estado del ganador
  await TournamentParticipant.findByIdAndUpdate(winnerId, {
    status: 'checked_in'
  });

  // Si hay un nextMatch, avanzar al ganador
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
  }

  // Emitir evento Socket.IO
  emitMatchReported(matchId, match);

  res.status(200).json({
    success: true,
    message: 'Resultado validado exitosamente',
    data: match
  });
});

/**
 * @route   POST /api/matches/:id/report
 * @desc    Reportar resultado de un match
 * @access  Referee (assigned)
 */
export const reportMatchResult = asyncHandler(async (req, res) => {
  const result = await matchService.reportMatchResult(
    req.params.id,
    req.body,
    req.user._id
  );
  
  // Emitir evento Socket.IO
  emitMatchReported(req.params.id, result.match);
  
  res.status(200).json({
    success: true,
    message: 'Match result reported successfully',
    data: result
  });
});

/**
 * @route   POST /api/matches/:id/validate
 * @desc    Validar o editar un report
 * @access  Admin/Referee (assigned)
 */
export const validateReport = asyncHandler(async (req, res) => {
  const report = await matchService.validateReport(
    req.params.id,
    req.body,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    message: 'Report validated successfully',
    data: report
  });
});

/**
 * @route   POST /api/matches/:id/set-live
 * @desc    Marcar un match como "En Vivo"
 * @access  Private (Tournament Owner or Super Admin)
 */
export const setMatchLive = asyncHandler(async (req, res) => {
  const match = await matchService.setMatchLive(
    req.params.id,
    req.user._id
  );
  
  // Emitir evento Socket.IO
  emitMatchReported(req.params.id, match);
  
  res.status(200).json({
    success: true,
    message: 'Match marcado como en vivo',
    data: match
  });
});

/**
 * @route   PUT /api/matches/:id/edit-result
 * @desc    Editar resultado de un match (solo si la fase no ha terminado)
 * @access  Private (Tournament Owner or Super Admin)
 */
export const editMatchResult = asyncHandler(async (req, res) => {
  const result = await matchService.editMatchResult(
    req.params.id,
    req.body,
    req.user._id
  );
  
  // Emitir evento Socket.IO
  emitMatchReported(req.params.id, result.match);
  
  res.status(200).json({
    success: true,
    message: 'Resultado editado exitosamente',
    data: result
  });
});

/**
 * @route   POST /api/tournaments/:id/generate-next-phase
 * @desc    Generar siguiente fase del torneo
 * @access  Private (Tournament Owner or Super Admin)
 */
export const generateNextPhase = asyncHandler(async (req, res) => {
  const { round } = req.body;
  
  const result = await matchService.generateNextPhase(
    req.params.id,
    round,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      matches: result.matches,
      round: result.round
    }
  });
});

/**
 * @route   POST /api/tournaments/:id/finalize
 * @desc    Finalizar torneo
 * @access  Private (Tournament Owner or Super Admin)
 */
export const finalizeTournament = asyncHandler(async (req, res) => {
  const { round } = req.body;
  
  const result = await matchService.finalizeTournament(
    req.params.id,
    round,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      winner: result.winner,
      tournament: result.tournament
    }
  });
});
