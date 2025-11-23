import * as tournamentService from '../services/tournament.service.js';
import { asyncHandler } from '../utils/errorHandler.js';
import Tournament from '../models/Tournament.js';
import TournamentParticipant from '../models/TournamentParticipant.js';

/**
 * @route   POST /api/tournaments
 * @desc    Crear nuevo torneo
 * @access  Admin
 */
export const createTournament = asyncHandler(async (req, res) => {
  console.log('Creating tournament with user:', req.user?._id);
  console.log('Tournament data:', req.body);
  
  const tournament = await tournamentService.createTournament(req.body, req.user._id);
  
  res.status(201).json({
    success: true,
    message: 'Tournament created successfully',
    data: tournament
  });
});

/**
 * @route   GET /api/tournaments
 * @desc    Obtener todos los torneos
 * @access  Public
 */
export const getAllTournaments = asyncHandler(async (req, res) => {
  const result = await tournamentService.getAllTournaments(req.query);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   GET /api/tournaments/:id
 * @desc    Obtener torneo por ID
 * @access  Public
 */
export const getTournamentById = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.getTournamentById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: tournament
  });
});

/**
 * @route   PUT /api/tournaments/:id
 * @desc    Actualizar torneo
 * @access  Admin/Creator
 */
export const updateTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.updateTournament(
    req.params.id,
    req.body,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    message: 'Tournament updated successfully',
    data: tournament
  });
});

/**
 * @route   DELETE /api/tournaments/:id
 * @desc    Eliminar torneo
 * @access  Admin/Creator
 */
export const deleteTournament = asyncHandler(async (req, res) => {
  const result = await tournamentService.deleteTournament(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   POST /api/tournaments/:id/open-registration
 * @desc    Abrir inscripciones de un torneo
 * @access  Owner/Super Admin
 */
export const openRegistration = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.openRegistration(
    req.params.id,
    req.body,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    message: 'Registration opened successfully',
    data: tournament
  });
});

/**
 * @route   POST /api/tournaments/:id/register
 * @desc    Registrarse en un torneo
 * @access  Player/Captain
 */
export const registerForTournament = asyncHandler(async (req, res) => {
  const participantData = {
    player: req.user._id // Solo jugadores individuales ahora
  };

  const participant = await tournamentService.registerParticipant(
    req.params.id,
    participantData
  );
  
  res.status(201).json({
    success: true,
    message: 'Registered successfully',
    data: participant
  });
});

/**
 * @route   POST /api/tournaments/:id/generate-bracket
 * @desc    Generar bracket del torneo
 * @access  Admin/Creator
 */
export const generateBracket = asyncHandler(async (req, res) => {
  const result = await tournamentService.generateBracket(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   GET /api/tournaments/:id/matches
 * @desc    Obtener matches de un torneo
 * @access  Public
 */
export const getTournamentMatches = asyncHandler(async (req, res) => {
  const matches = await tournamentService.getTournamentMatches(
    req.params.id,
    req.query.round
  );
  
  res.status(200).json({
    success: true,
    data: matches
  });
});

/**
 * @route   POST /api/tournaments/:id/start
 * @desc    Iniciar un torneo (cambiar status a in_progress)
 * @access  Private (Owner del torneo o Super Admin)
 */
export const startTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    res.status(404);
    throw new Error('Torneo no encontrado');
  }

  // Verificar que el bracket esté generado
  if (!tournament.bracketGenerated) {
    res.status(400);
    throw new Error('Debe generar el bracket antes de iniciar el torneo');
  }

  // Verificar que haya participantes suficientes
  const participantCount = await TournamentParticipant.countDocuments({
    tournament: tournament._id,
    status: { $in: ['registered', 'checked_in'] }
  });

  if (participantCount < 2) {
    res.status(400);
    throw new Error('Se necesitan al menos 2 participantes para iniciar el torneo');
  }

  // Cambiar status a in_progress
  tournament.status = 'in_progress';
  await tournament.save();

  res.status(200).json({
    success: true,
    message: 'Torneo iniciado exitosamente',
    data: tournament
  });
});
