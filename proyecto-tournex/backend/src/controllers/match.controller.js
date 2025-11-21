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
 * @route   POST /api/matches/:id/evidence
 * @desc    Subir evidencia para un match
 * @access  Referee (assigned)
 */
export const uploadEvidence = asyncHandler(async (req, res) => {
  // Asumiendo que el archivo ya fue procesado por multer
  const evidenceData = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
    description: req.body.description
  };

  const evidence = await matchService.uploadEvidence(
    req.params.id,
    evidenceData,
    req.user._id
  );
  
  res.status(201).json({
    success: true,
    message: 'Evidence uploaded successfully',
    data: evidence
  });
});

/**
 * @route   GET /api/matches/:id/evidences
 * @desc    Obtener evidencias de un match
 * @access  Public
 */
export const getMatchEvidences = asyncHandler(async (req, res) => {
  const evidences = await matchService.getMatchEvidences(req.params.id);
  
  res.status(200).json({
    success: true,
    data: evidences
  });
});

/**
 * @route   POST /api/matches/:id/reassign
 * @desc    Reasignar árbitro a un match
 * @access  Admin
 */
export const reassignReferee = asyncHandler(async (req, res) => {
  const { newRefereeId } = req.body;
  
  const match = await matchService.reassignReferee(
    req.params.id,
    newRefereeId,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    message: 'Referee reassigned successfully',
    data: match
  });
});
