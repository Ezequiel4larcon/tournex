// Middleware para verificar roles de usuario

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para realizar esta acción' 
      });
    }

    next();
  };
};

// Verificar si es super admin
export const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autenticado' 
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Solo los super administradores pueden realizar esta acción' 
    });
  }

  next();
};

// Verificar si es owner del torneo o super admin
export const isTournamentOwnerOrSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autenticado' 
    });
  }

  // Super admin siempre tiene acceso
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Verificar si es el owner del torneo
  // El tournamentId puede venir de params o del objeto tournament en req
  const tournamentId = req.params.id || req.params.tournamentId || req.tournament?._id;
  
  if (!tournamentId) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID de torneo no proporcionado' 
    });
  }

  // Si ya tenemos el objeto tournament en req (de otro middleware)
  if (req.tournament) {
    if (req.tournament.owner.toString() === req.user._id.toString()) {
      return next();
    }
  }

  // Si no, necesitamos buscar el torneo
  try {
    const Tournament = (await import('../models/Tournament.js')).default;
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ 
        success: false, 
        message: 'Torneo no encontrado' 
      });
    }

    if (tournament.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo el creador del torneo puede realizar esta acción' 
      });
    }

    // Guardar el torneo en req para uso posterior
    req.tournament = tournament;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al verificar permisos' 
    });
  }
};
