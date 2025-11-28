import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/errorHandler.js';

/**
 * Servicio de registro de usuario
 */
export const registerUser = async (userData) => {
  const { username, email, password } = userData;

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  
  if (existingUser) {
    throw new ApiError(400, 'User with this email or username already exists');
  }

  // Hashear contraseña
  const hashedPassword = await hashPassword(password);

  // Crear usuario
  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });

  // Generar token
  const token = generateToken({ id: user._id, role: user.role });

  // Emitir evento de registro (Event-driven)
  user.lastLogin = new Date();
  await user.save();

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },
    token
  };
};

/**
 * Servicio de login de usuario
 */
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Buscar usuario con contraseña
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Verificar contraseña
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account is inactive');
  }

  // Actualizar último login
  user.lastLogin = new Date();
  await user.save();

  // Generar token
  const token = generateToken({ id: user._id, role: user.role });

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      lastLogin: user.lastLogin
    },
    token
  };
};

/**
 * Servicio para obtener perfil de usuario
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

/**
 * Servicio para actualizar perfil de usuario
 */
export const updateUserProfile = async (userId, updateData) => {
  const { username, email, avatar } = updateData;

  // Si se actualiza email o username, verificar unicidad
  if (email || username) {
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : [])
      ],
      _id: { $ne: userId }
    });

    if (existingUser) {
      throw new ApiError(400, 'Email or username already in use');
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { username, email, avatar },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

/**
 * Servicio para cambiar contraseña
 */
export const changePassword = async (userId, passwords) => {
  const { currentPassword, newPassword } = passwords;

  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verificar contraseña actual
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hashear nueva contraseña
  user.password = await hashPassword(newPassword);
  await user.save();

  return { message: 'Password updated successfully' };
};
