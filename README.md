# TourneX - Sistema de Gestión de Torneos

Sistema completo de torneos 1v1 desarrollado con Node.js, Express, MongoDB en el backend y React, Tailwind CSS en el frontend.

## 📋 Resumen del Sistema

TourneX es una plataforma de torneos 1v1 (player vs player) donde cualquier usuario puede crear y moderar sus propios torneos. El sistema permite la gestión completa de torneos de eliminación simple con brackets interactivos, validación de resultados en tiempo real y notificaciones vía Socket.IO.

### Modelo de Negocio

#### Roles de Usuario

**Player** (Rol por defecto)
- Puede registrarse en la plataforma
- Puede crear torneos (convirtiéndose en owner/moderador de ese torneo)
- Puede unirse a torneos disponibles
- Compite en partidas 1v1 contra otros jugadores

**Super Admin** (Rol especial)
- Tiene permisos globales sobre toda la plataforma
- Puede ver, editar y eliminar cualquier torneo
- Puede moderar cualquier torneo
- Puede validar resultados de cualquier partida

#### Flujo de un Torneo

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

## 🚀 Tecnologías

### Backend
- **Node.js** + **Express** - Servidor web
- **MongoDB** + **Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas
- **Socket.IO** - Notificaciones en tiempo real
- **express-validator** - Validación de datos

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento SPA
- **Context API** - Gestión de estado global
- **Socket.IO Client** - WebSockets cliente

## 📁 Estructura del Proyecto

```
proyecto-tournex/
├── backend/              # Servidor Node.js
│   ├── src/
│   │   ├── config/      # Configuración
│   │   ├── models/      # Modelos de Mongoose
│   │   ├── controllers/ # Controladores
│   │   ├── services/    # Lógica de negocio
│   │   ├── routes/      # Rutas de API
│   │   ├── middlewares/ # Middlewares
│   │   ├── utils/       # Utilidades
│   │   ├── app.js       # Aplicación Express
│   │   └── server.js    # Servidor
│   ├── uploads/         # Archivos subidos
│   ├── package.json
│   └── README.md
│
└── frontend/            # Aplicación React
    ├── src/
    │   ├── api/         # Cliente API
    │   ├── components/  # Componentes
    │   ├── context/     # Contextos
    │   ├── hooks/       # Custom hooks
    │   ├── pages/       # Páginas
    │   ├── router/      # Rutas
    │   └── utils/       # Utilidades
    ├── package.json
    └── README.md
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+ instalado
- MongoDB instalado y corriendo
- npm o yarn

### 1. Clonar el repositorio

```bash
cd proyecto-tournex
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus configuraciones
```

**Archivo `.env` del backend:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tournex
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install

# Crear archivo .env (opcional)
cp .env.example .env
```

**Archivo `.env` del frontend:**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Ejecución

### Iniciar MongoDB

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Iniciar Backend

```bash
cd backend
npm run dev
```
El backend estará disponible en `http://localhost:5000`

### Iniciar Frontend

```bash
cd frontend
npm run dev
```
El frontend estará disponible en `http://localhost:3000`

## 📚 Características

### Autenticación y Usuarios
- ✅ Registro de usuarios
- ✅ Inicio de sesión con email
- ✅ Autenticación JWT
- ✅ Roles (player, super_admin)
- ✅ Actualización de perfil
- ✅ Cambio de contraseña
- ✅ Avatar de usuario

### Gestión de Torneos
- ✅ Crear torneos (cualquier usuario)
- ✅ Editar y eliminar torneos (owner o super_admin)
- ✅ Inscripción de jugadores (1v1)
- ✅ Generación automática de brackets
- ✅ Estados: pending, registration_open, registration_closed, in_progress, completed
- ✅ Validación de fechas de registro e inicio
- ✅ Contador de participantes
- ✅ Límite de participantes: 2, 4, 8, 16, 32
- ✅ Banear participantes (owner o super_admin)

### Sistema de Partidas (Matches)
- ✅ Partidas 1v1 (player vs player)
- ✅ Reportar resultados (owner o super_admin)
- ✅ Validar resultados
- ✅ Editar resultados (si la fase no ha terminado)
- ✅ Marcar partidas como "En Vivo"
- ✅ Estados: pending, in_progress, completed, cancelled
- ✅ Score y notas de partidas
- ✅ Avance automático de ganadores en el bracket

### Notificaciones en Tiempo Real
- ✅ Socket.IO para actualizaciones en vivo
- ✅ Notificación de inscripción a torneo
- ✅ Notificación de inicio de torneo
- ✅ Notificación de fin de torneo
- ✅ Notificación de resultado reportado
- ✅ Contador de notificaciones no leídas
- ✅ Marcar notificaciones como leídas

### Interfaz de Usuario
- ✅ Dashboard con estadísticas personalizadas
- ✅ Lista de torneos disponibles
- ✅ Detalle de torneos con participantes
- ✅ Bracket visual interactivo
- ✅ Indicadores visuales de estado (En Vivo, Completado)
- ✅ Panel de notificaciones
- ✅ Diseño responsivo con TailwindCSS
- ✅ Tema oscuro (oklch colors)

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
```
POST   /register         - Registrar usuario
POST   /login            - Iniciar sesión
GET    /profile          - Obtener perfil (protegido)
PUT    /profile          - Actualizar perfil (protegido)
PUT    /change-password  - Cambiar contraseña (protegido)
POST   /logout           - Cerrar sesión (protegido)
```

### Torneos (`/api/tournaments`)
```
GET    /                      - Listar torneos
POST   /                      - Crear torneo (protegido)
GET    /:id                   - Ver detalle de torneo
PUT    /:id                   - Editar torneo (owner o super_admin)
DELETE /:id                   - Eliminar torneo (owner o super_admin)
POST   /:id/register          - Inscribirse a torneo (protegido)
POST   /:id/open-registration - Abrir inscripciones (owner o super_admin)
POST   /:id/generate-bracket  - Generar brackets (owner o super_admin)
POST   /:id/start             - Iniciar torneo (owner o super_admin)
GET    /:id/matches           - Obtener partidas del torneo
POST   /:id/ban/:participantId - Banear participante (owner o super_admin)
```

### Partidas (`/api/matches`)
```
GET    /:id                  - Ver detalle de partida
POST   /:id/report           - Reportar resultado (protegido)
POST   /:id/validate-result  - Validar resultado (owner o super_admin)
PUT    /:id/edit-result      - Editar resultado (owner o super_admin)
POST   /:id/set-live         - Marcar como "En Vivo" (owner o super_admin)
```

### Notificaciones (`/api/notifications`)
```
GET    /                - Listar notificaciones (protegido)
GET    /unread-count    - Contador de no leídas (protegido)
PUT    /:id/read        - Marcar como leída (protegido)
PUT    /read-all        - Marcar todas como leídas (protegido)
DELETE /:id             - Eliminar notificación (protegido)
```

### Usuarios (`/api/users`)
```
GET    /              - Listar usuarios (super_admin)
GET    /:id           - Ver perfil de usuario (super_admin)
PUT    /:id/role      - Cambiar rol (super_admin)
PUT    /:id/status    - Activar/suspender (super_admin)
```

## 🔐 Roles y Permisos

### Player (Usuario por defecto)
- Crear torneos
- Inscribirse a torneos
- Ver torneos y partidas
- Recibir notificaciones
- Como **owner de su torneo**:
  - Editar/eliminar su torneo
  - Generar brackets
  - Iniciar torneo
  - Validar resultados de partidas
  - Marcar partidas como "En Vivo"
  - Editar resultados (si la fase no terminó)
  - Banear participantes

### Super Admin
- Todo lo de Player +
- Permisos globales sobre todos los torneos:
  - Editar/eliminar cualquier torneo
  - Validar resultados de cualquier partida
  - Marcar cualquier partida como "En Vivo"
  - Editar resultados de cualquier partida
  - Banear participantes de cualquier torneo
- Gestión de usuarios:
  - Ver lista de usuarios
  - Cambiar roles de usuarios
  - Activar/suspender usuarios

## 📦 Modelos de Base de Datos

### User
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
