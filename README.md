# TourneX - Sistema de Gestión de Torneos

Plataforma de torneos 1v1 con brackets de eliminación simple, gestión en tiempo real y notificaciones vía Socket.IO.

## 📋 Modelo de Negocio

**TourneX** permite a cualquier usuario crear y gestionar torneos competitivos 1v1. El sistema soporta torneos de eliminación simple con generación automática de brackets, validación de resultados y seguimiento en vivo de partidos.

### Roles

- **Player**: Crea torneos (se convierte en owner), se registra en torneos y compite en partidas 1v1
- **Super Admin**: Gestión completa de usuarios, permisos globales sobre todos los torneos

### Flujo de Torneo

1. **Creación**: Usuario crea torneo (capacidad: 2-32 participantes)
2. **Registro**: Período de inscripción abierto por el owner
3. **Brackets**: Generación automática de llaves (maneja participantes impares con sistema BYE)
4. **Partidos**: Owner marca partidos en vivo, reporta resultados con scores
5. **Progresión**: Avance manual de fases por el owner
6. **Finalización**: Torneo completa cuando se determina el ganador

### Características Clave

- Sistema BYE para torneos con participantes impares (pase automático)
- Partidos en vivo con indicadores visuales para todos los usuarios
- Control manual de progresión de fases
- Validaciones de edición (no editar partidos BYE, rondas completadas o torneos finalizados)
- Notificaciones en tiempo real vía Socket.IO
- Panel de administración con CRUD completo de usuarios

## ⚙️ Configuración Backend

Crear archivo `.env` en `/backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tournex
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Variables:**
- `PORT`: Puerto del servidor Express (default: 5000)
- `MONGODB_URI`: Conexión a MongoDB (local o MongoDB Atlas)
- `JWT_SECRET`: Clave secreta para firmar tokens JWT (usar string aleatorio y seguro)
- `JWT_EXPIRES_IN`: Duración de sesión (ej: 7d, 24h, 30m)
- `NODE_ENV`: Entorno de ejecución (development/production)

## 🚀 Ejecución

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**URLs:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

---

**Nota**: Requiere MongoDB corriendo localmente o conexión a MongoDB Atlas configurada en `.env`
```javascript
{
  username: String (único),
  email: String (único),
  password: String (hasheado con bcrypt),
  role: ['player', 'super_admin'] (default: 'player'),
  isActive: Boolean,
  avatar: String,
  lastLogin: Date
}
```

### Tournament
```javascript
{
  name: String,
  game: String,
  description: String,
  format: 'single_elimination',
  maxParticipants: Number [2,4,8,16,32],
  currentParticipants: Number,
  status: ['pending', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled'],
  registrationStartDate: Date,
  registrationEndDate: Date,
  startDate: Date,
  endDate: Date,
  prize: String,
  rules: String,
  bracketGenerated: Boolean,
  owner: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  winner: ObjectId (ref: TournamentParticipant)
}
```

### TournamentParticipant
```javascript
{
  tournament: ObjectId (ref: Tournament),
  player: ObjectId (ref: User),
  status: ['registered', 'checked_in', 'eliminated', 'winner', 'banned'],
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
  matchNumber: Number,
  participant1: ObjectId (ref: TournamentParticipant),
  participant2: ObjectId (ref: TournamentParticipant),
  winner: ObjectId (ref: TournamentParticipant),
  score: {
    participant1Score: Number,
    participant2Score: Number
  },
  status: ['pending', 'in_progress', 'completed', 'cancelled'],
  nextMatch: ObjectId (ref: Match),
  notes: String
}
```

### MatchReport
```javascript
{
  match: ObjectId (ref: Match),
  reportedBy: ObjectId (ref: User),
  winner: ObjectId (ref: TournamentParticipant),
  score: Object,
  notes: String
}
```

### Notification
```javascript
{
  recipient: ObjectId (ref: User),
  type: String,
  message: String,
  isRead: Boolean,
  relatedEntity: {
    entityType: ['Tournament', 'Match'],
    entityId: ObjectId
  }
}
```

## 🎨 Capturas de Pantalla

_(Aquí puedes agregar capturas de pantalla de tu aplicación)_

## 📦 Scripts Disponibles

### Backend
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linting
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Variables de Entorno

### Backend
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `5000` |
| `MONGODB_URI` | URI de MongoDB | `mongodb://localhost:27017/tournex` |
| `JWT_SECRET` | Secret para JWT | `tu_secreto_seguro` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `NODE_ENV` | Entorno | `development` o `production` |

### Frontend
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL de la API | `http://localhost:5000/api` |

## 🚢 Despliegue

### Backend (Heroku/Railway)
```bash
# Asegurar variables de entorno en producción
# Configurar MongoDB Atlas o similar
# Push a main branch
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy carpeta dist/
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Desarrollado para el proyecto TOURNEX

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor abre un issue con:
- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado
- Screenshots (si aplica)

## 🔄 Eventos Socket.IO

### v1.0.0 (2024)
- ✅ Sistema de autenticación completo con JWT
- ✅ Gestión de torneos 1v1
- ✅ Generación automática de brackets
- ✅ Sistema de partidas con validación
- ✅ Funcionalidad "En Vivo" para partidas
- ✅ Edición de resultados con restricciones
- ✅ Sistema de baneo de participantes
- ✅ Notificaciones en tiempo real con Socket.IO
- ✅ Dashboard con estadísticas personalizadas
- ✅ Bracket interactivo visual
- ✅ UI completa con TailwindCSS

## 📝 Scripts de Utilidad

### Crear Super Admin
```bash
cd backend
node src/scripts/createSuperAdmin.js
```

### Limpiar Base de Datos (Desarrollo)
```bash
cd backend
node src/scripts/cleanTournaments.js
```

## 📞 Soporte

Para soporte, por favor contacta al equipo de desarrollo o abre un issue en GitHub.

## 🔄 Eventos Socket.IO

### Conexión
- `connection` - Usuario se conecta
- `disconnect` - Usuario se desconecta
- `join_tournament` - Usuario se une a sala de torneo
- `leave_tournament` - Usuario sale de sala de torneo

### Notificaciones
- `new_notification` - Nueva notificación para el usuario
- `match_reported` - Resultado de partida reportado
- `tournament_started` - Torneo iniciado
- `tournament_completed` - Torneo completado
- `participant_banned` - Participante baneado

---

**¡Gracias por usar TourneX!** 🎉
