import File from '../models/File.js';
import fs from 'fs/promises';
import path from 'path';
import { ApiError } from '../utils/errorHandler.js';

/**
 * Servicio para guardar información del archivo en la base de datos
 */
export const saveFile = async (fileData, uploadedBy, relatedTo) => {
  const file = await File.create({
    filename: fileData.filename,
    originalName: fileData.originalname,
    mimetype: fileData.mimetype,
    size: fileData.size,
    path: fileData.path,
    uploadedBy,
    relatedTo
  });

  return file;
};

/**
 * Servicio para obtener archivo por ID
 */
export const getFileById = async (fileId) => {
  const file = await File.findById(fileId).populate('uploadedBy', 'username email');

  if (!file) {
    throw new ApiError(404, 'File not found');
  }

  return file;
};

/**
 * Servicio para obtener archivos de un usuario
 */
export const getUserFiles = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    File.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    File.countDocuments({ uploadedBy: userId })
  ]);

  return {
    files,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Servicio para obtener archivos relacionados con un modelo específico
 */
export const getRelatedFiles = async (model, id) => {
  const files = await File.find({
    'relatedTo.model': model,
    'relatedTo.id': id
  }).sort({ createdAt: -1 });

  return files;
};

/**
 * Servicio para eliminar archivo
 */
export const deleteFile = async (fileId, userId, userRole) => {
  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, 'File not found');
  }

  // Verificar permisos: solo el usuario que subió el archivo o admin puede eliminarlo
  if (file.uploadedBy.toString() !== userId && !['admin', 'moderator'].includes(userRole)) {
    throw new ApiError(403, 'Not authorized to delete this file');
  }

  // Eliminar archivo físico
  try {
    await fs.unlink(file.path);
  } catch (error) {
    console.error('Error deleting physical file:', error);
    // Continuar aunque falle la eliminación física
  }

  // Eliminar registro de base de datos
  await file.deleteOne();

  return { message: 'File deleted successfully' };
};

/**
 * Servicio para actualizar información del archivo
 */
export const updateFile = async (fileId, updateData, userId, userRole) => {
  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, 'File not found');
  }

  // Verificar permisos
  if (file.uploadedBy.toString() !== userId && !['admin', 'moderator'].includes(userRole)) {
    throw new ApiError(403, 'Not authorized to update this file');
  }

  Object.assign(file, updateData);
  await file.save();

  return file;
};

/**
 * Servicio para obtener estadísticas de archivos de un usuario
 */
export const getUserFileStats = async (userId) => {
  const stats = await File.aggregate([
    { $match: { uploadedBy: userId } },
    {
      $group: {
        _id: '$mimetype',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);

  const totalFiles = await File.countDocuments({ uploadedBy: userId });
  const totalSize = stats.reduce((acc, curr) => acc + curr.totalSize, 0);

  return {
    totalFiles,
    totalSize,
    byType: stats
  };
};
