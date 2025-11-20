import * as teamService from '../services/team.service.js';
import { asyncHandler } from '../utils/errorHandler.js';

/**
 * @route   POST /api/teams
 * @desc    Crear equipo
 * @access  Player
 */
export const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.body, req.user._id);
  
  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: team
  });
});

/**
 * @route   GET /api/teams
 * @desc    Obtener todos los equipos
 * @access  Public
 */
export const getAllTeams = asyncHandler(async (req, res) => {
  const result = await teamService.getAllTeams(req.query);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   GET /api/teams/:id
 * @desc    Obtener equipo por ID
 * @access  Public
 */
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: team
  });
});

/**
 * @route   PUT /api/teams/:id
 * @desc    Actualizar equipo
 * @access  Captain
 */
export const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(req.params.id, req.body, req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Team updated successfully',
    data: team
  });
});

/**
 * @route   DELETE /api/teams/:id
 * @desc    Eliminar equipo
 * @access  Captain
 */
export const deleteTeam = asyncHandler(async (req, res) => {
  const result = await teamService.deleteTeam(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   POST /api/teams/:id/join
 * @desc    Solicitar unirse a un equipo
 * @access  Player
 */
export const requestJoinTeam = asyncHandler(async (req, res) => {
  const request = await teamService.requestJoinTeam(
    req.params.id,
    req.user._id,
    req.body.message
  );
  
  res.status(201).json({
    success: true,
    message: 'Join request sent successfully',
    data: request
  });
});

/**
 * @route   GET /api/teams/:id/requests
 * @desc    Obtener solicitudes pendientes del equipo
 * @access  Captain
 */
export const getTeamRequests = asyncHandler(async (req, res) => {
  const requests = await teamService.getTeamRequests(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    data: requests
  });
});

/**
 * @route   POST /api/teams/requests/:requestId/respond
 * @desc    Aceptar o rechazar solicitud
 * @access  Captain
 */
export const respondToRequest = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'accepted' or 'rejected'
  
  const request = await teamService.respondToRequest(
    req.params.requestId,
    action,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    message: `Request ${action} successfully`,
    data: request
  });
});

/**
 * @route   DELETE /api/teams/:id/members/:memberId
 * @desc    Expulsar miembro del equipo
 * @access  Captain
 */
export const kickMember = asyncHandler(async (req, res) => {
  const result = await teamService.kickMember(
    req.params.id,
    req.params.memberId,
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   POST /api/teams/:id/leave
 * @desc    Abandonar equipo
 * @access  Player (member)
 */
export const leaveTeam = asyncHandler(async (req, res) => {
  const result = await teamService.leaveTeam(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    ...result
  });
});
