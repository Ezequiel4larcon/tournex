import * as fileService from '../services/file.service.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { ApiError } from '../utils/errorHandler.js';

/**
 * @desc    Subir archivo
 * @route   POST /api/files/upload
 * @access  Private
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const { relatedModel, relatedId } = req.body;

  if (!relatedModel || !relatedId) {
    throw new ApiError(400, 'Related model and ID are required');
  }

  const file = await fileService.saveFile(
    req.file,
    req.user._id,
    {
      model: relatedModel,
      id: relatedId
    }
  );

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: file
  });
});

/**
 * @desc    Subir múltiples archivos
 * @route   POST /api/files/upload-multiple
 * @access  Private
 */
export const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files uploaded');
  }

  const { relatedModel, relatedId } = req.body;

  if (!relatedModel || !relatedId) {
    throw new ApiError(400, 'Related model and ID are required');
  }

  const uploadPromises = req.files.map(file =>
    fileService.saveFile(
      file,
      req.user._id,
      {
        model: relatedModel,
        id: relatedId
      }
    )
  );

  const files = await Promise.all(uploadPromises);

  res.status(201).json({
    success: true,
    message: `${files.length} files uploaded successfully`,
    data: files
  });
});

/**
 * @desc    Obtener archivo por ID
 * @route   GET /api/files/:id
 * @access  Public
 */
export const getFile = asyncHandler(async (req, res) => {
  const file = await fileService.getFileById(req.params.id);

  res.status(200).json({
    success: true,
    data: file
  });
});

/**
 * @desc    Obtener archivos del usuario actual
 * @route   GET /api/files/my-files
 * @access  Private
 */
export const getMyFiles = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await fileService.getUserFiles(req.user._id, page, limit);

  res.status(200).json({
    success: true,
    data: result.files,
    pagination: result.pagination
  });
});

/**
 * @desc    Obtener archivos relacionados
 * @route   GET /api/files/related/:model/:id
 * @access  Public
 */
export const getRelatedFiles = asyncHandler(async (req, res) => {
  const { model, id } = req.params;

  const files = await fileService.getRelatedFiles(model, id);

  res.status(200).json({
    success: true,
    data: files
  });
});

/**
 * @desc    Eliminar archivo
 * @route   DELETE /api/files/:id
 * @access  Private
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const result = await fileService.deleteFile(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Obtener estadísticas de archivos del usuario
 * @route   GET /api/files/stats
 * @access  Private
 */
export const getFileStats = asyncHandler(async (req, res) => {
  const stats = await fileService.getUserFileStats(req.user._id);

  res.status(200).json({
    success: true,
    data: stats
  });
});
