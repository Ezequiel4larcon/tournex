import User from '../models/User.js';
import { errorHandler } from '../utils/errorHandler.js';

// Obtener todos los usuarios (super admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('currentTeam', 'name emoji');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// Cambiar rol de usuario (solo super admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // Validar que el rol sea válido
    const validRoles = ['player', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    // No permitir que un super admin se quite sus propios permisos
    if (req.user._id.toString() === id && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol de super admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Rol actualizado a ${role}`,
      data: user
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// Suspender/activar usuario
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un super admin se suspenda a sí mismo
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio estado'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'suspendido'}`,
      data: {
        _id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// Eliminar usuario (solo super admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un super admin se elimine a sí mismo
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// Obtener estadísticas de usuarios (dashboard super admin)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const playerCount = await User.countDocuments({ role: 'player' });
    const superAdminCount = await User.countDocuments({ role: 'super_admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const suspendedUsers = await User.countDocuments({ isActive: false });

    // Usuarios registrados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        byRole: {
          players: playerCount,
          superAdmins: superAdminCount
        },
        byStatus: {
          active: activeUsers,
          suspended: suspendedUsers
        },
        recentRegistrations: recentUsers
      }
    });
  } catch (error) {
    errorHandler(res, error);
  }
};
