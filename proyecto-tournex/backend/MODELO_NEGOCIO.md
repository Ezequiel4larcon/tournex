# Modelo de Negocio - TourneX

## Resumen del Sistema

TourneX es una plataforma de torneos 1v1 (player vs player) donde cualquier usuario puede crear y moderar sus propios torneos.

## Roles de Usuario

### 1. **Player** (Rol por defecto)
- Puede registrarse en la plataforma
- Puede crear torneos (convirtiéndose en owner/moderador de ese torneo)
- Puede unirse a torneos disponibles
- Compite en partidas 1v1 contra otros jugadores

### 2. **Super Admin** (Rol especial)
- Tiene permisos globales sobre toda la plataforma
- Puede ver, editar y eliminar cualquier torneo
- Puede ver jugadores activos e inactivos
- Puede moderar cualquier torneo
- Puede cambiar roles de usuarios
- Puede suspender/activar usuarios

## Estructura de Torneos

### Creación de Torneos
- **Cualquier usuario autenticado puede crear un torneo**
- El creador automáticamente se convierte en el **owner/moderador** del torneo
- Propiedades del torneo:
  - Nombre
  - Juego
  - Formato (eliminación simple, doble, round robin, swiss)
  - Máximo de participantes
  - Fechas de registro e inicio

### Participación
- **Modo 1v1 exclusivamente** - No hay equipos
- Los usuarios se unen directamente al torneo
- Al unirse, pasan automáticamente a la lista de participantes
- Estado: `registered`, `checked_in`, `eliminated`, `winner`

### Brackets y Partidas
- El owner del torneo genera el bracket
- Las partidas son **player vs player**
- Estados de partida: `pending`, `in_progress`, `completed`, `cancelled`

## Moderación y Validación

### Owner del Torneo (Creador)
El usuario que crea un torneo tiene los siguientes permisos **solo sobre su torneo**:

1. **Gestión del Torneo**
   - Editar información del torneo
   - Eliminar el torneo
   - Generar brackets
   - Iniciar el torneo

2. **Validación de Resultados**
   - El owner actúa como árbitro/moderador
   - Valida y registra los resultados de las partidas
   - Los participantes **NO reportan resultados**
   - El owner ingresa:
     - Ganador de la partida
     - Score (puntuación)
     - Notas adicionales

3. **Moderación de Participantes**
   - Puede ver la lista de participantes
   - Puede gestionar el estado de los participantes

### Super Admin
Tiene **permisos globales** sobre todos los torneos:
- Ver/editar/eliminar cualquier torneo
- Validar resultados de cualquier partida
- Ver y gestionar todos los usuarios
- Cambiar roles de usuarios
- Suspender/activar usuarios

## Flujo de un Torneo

```
1. Usuario crea torneo → Se convierte en owner/moderador
2. Período de registro → Jugadores se unen (1v1)
3. Owner genera brackets → Se crean partidas player vs player
4. Owner inicia torneo → Estado: in_progress
5. Las partidas se juegan
6. Owner valida resultados → Ingresa ganador y score
7. Bracket avanza automáticamente
8. Torneo completa → Se determina el ganador
```

## Permisos Detallados

### Crear Torneo
- ✅ Cualquier usuario autenticado
- ✅ Super admin

### Editar/Eliminar Torneo
- ✅ Owner del torneo
- ✅ Super admin
- ❌ Otros usuarios

### Unirse a Torneo
- ✅ Cualquier usuario autenticado (excepto si ya está registrado)

### Generar Brackets
- ✅ Owner del torneo
- ✅ Super admin

### Validar Resultados de Partidas
- ✅ Owner del torneo (solo sus torneos)
- ✅ Super admin (cualquier torneo)
- ❌ Participantes (no pueden reportar)

### Gestión de Usuarios
- ✅ Solo super admin
  - Ver todos los usuarios
  - Cambiar roles
  - Suspender/activar

## Modelos Principales

### User
```javascript
{
  username: String (único),
  email: String (único),
  password: String (hasheado),
  role: ['player', 'super_admin'] (default: 'player'),
  isActive: Boolean,
  avatar: String
}
```

### Tournament
```javascript
{
  name: String,
  game: String,
  format: ['single_elimination', 'double_elimination', 'round_robin', 'swiss'],
  maxParticipants: Number,
  status: ['pending', 'registration_open', 'in_progress', 'completed'],
  owner: ObjectId (ref: User), // Creador/moderador
  registrationStartDate: Date,
  registrationEndDate: Date,
  startDate: Date,
  endDate: Date
}
```

### TournamentParticipant
```javascript
{
  tournament: ObjectId (ref: Tournament),
  player: ObjectId (ref: User),
  status: ['registered', 'checked_in', 'eliminated', 'winner'],
  seed: Number,
  wins: Number,
  losses: Number
}
```

### Match
```javascript
{
  tournament: ObjectId (ref: Tournament),
  round: Number,
  participant1: ObjectId (ref: TournamentParticipant),
  participant2: ObjectId (ref: TournamentParticipant),
  winner: ObjectId (ref: TournamentParticipant),
  score: {
    participant1Score: Number,
    participant2Score: Number
  },
  status: ['pending', 'in_progress', 'completed', 'cancelled'],
  validatedBy: ObjectId (ref: User), // Owner que validó
  validatedAt: Date,
  notes: String
}
```

## Endpoints API Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Torneos
- `GET /api/tournaments` - Listar torneos
- `POST /api/tournaments` - Crear torneo (autenticado)
- `GET /api/tournaments/:id` - Ver detalle de torneo
- `PUT /api/tournaments/:id` - Editar torneo (owner o super_admin)
- `DELETE /api/tournaments/:id` - Eliminar torneo (owner o super_admin)
- `POST /api/tournaments/:id/register` - Unirse a torneo
- `POST /api/tournaments/:id/generate-bracket` - Generar brackets (owner o super_admin)
- `POST /api/tournaments/:id/start` - Iniciar torneo (owner o super_admin)

### Partidas
- `GET /api/matches/:id` - Ver detalle de partida
- `POST /api/matches/:id/validate-result` - Validar resultado (owner o super_admin)

### Usuarios (Solo Super Admin)
- `GET /api/users` - Listar usuarios
- `GET /api/users/stats` - Estadísticas de usuarios
- `PUT /api/users/:id/role` - Cambiar rol
- `PATCH /api/users/:id/toggle-status` - Activar/suspender
- `DELETE /api/users/:id` - Eliminar usuario

## Cambios vs Modelo Anterior

### Eliminado
- ❌ Equipos (Team, TeamMember, TeamMembershipRequest)
- ❌ Roles de `referee` y `admin`
- ❌ Sistema de reportes de árbitros
- ❌ Disputas de partidas
- ❌ Evidencias de partidas
- ❌ Asignación de árbitros

### Simplificado
- ✅ Solo torneos 1v1 (player vs player)
- ✅ Solo 2 roles (player, super_admin)
- ✅ Owner del torneo valida resultados (no hay reportes de participantes)
- ✅ Cualquiera puede crear torneos

### Nuevo
- ✅ Campo `owner` en Tournament (creador/moderador)
- ✅ Campo `validatedBy` en Match (quien validó el resultado)
- ✅ Middleware `isTournamentOwnerOrSuperAdmin`
- ✅ Sistema simplificado de participación

## Seguridad

- Autenticación con JWT
- Passwords hasheados con bcrypt
- Validación de entrada con express-validator
- Middlewares de autorización por rol
- Verificación de ownership de torneos
- Protección contra auto-modificación de permisos (super_admin)
