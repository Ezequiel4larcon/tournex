import * as matchService from '../services/match.service.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { emitMatchReported } from '../config/socket.js';

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
