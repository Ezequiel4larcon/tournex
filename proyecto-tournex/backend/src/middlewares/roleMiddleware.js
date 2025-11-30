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

  try {
    let tournamentId;

    // Si ya tenemos el objeto tournament en req (de otro middleware)
    if (req.tournament) {
      tournamentId = req.tournament._id;
    } else {
      // Detectar si estamos en una ruta de match (/api/matches/:id/...)
      const isMatchRoute = req.baseUrl === '/api/matches' && req.params.id;
      
      if (isMatchRoute) {
        // Es una ruta de match, necesitamos obtener el tournament desde el match
        const Match = (await import('../models/Match.js')).default;
        const match = await Match.findById(req.params.id).populate('tournament');
        
        if (!match) {
          return res.status(404).json({ 
            success: false, 
            message: 'Partido no encontrado' 
          });
        }

        if (!match.tournament) {
          return res.status(404).json({ 
            success: false, 
            message: 'Torneo del partido no encontrado' 
          });
        }

        tournamentId = match.tournament._id;
        req.tournament = match.tournament;
        req.match = match;
      } else {
        // Es una ruta de tournament, usar el ID directamente
        tournamentId = req.params.id || req.params.tournamentId;
      }
    }
    
    if (!tournamentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de torneo no proporcionado' 
      });
    }

    // Si no tenemos el objeto tournament, buscarlo
    if (!req.tournament) {
      const Tournament = (await import('../models/Tournament.js')).default;
      const tournament = await Tournament.findById(tournamentId);
      
      if (!tournament) {
        return res.status(404).json({ 
          success: false, 
          message: 'Torneo no encontrado' 
        });
      }

      req.tournament = tournament;
    }

    // Verificar ownership
    if (req.tournament.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo el creador del torneo puede realizar esta acción' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al verificar permisos' 
    });
  }
};
