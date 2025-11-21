import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler, notFound } from './utils/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import commentRoutes from './routes/comment.routes.js';
import fileRoutes from './routes/file.routes.js';
import tournamentRoutes from './routes/tournament.routes.js';
import teamRoutes from './routes/team.routes.js';
import matchRoutes from './routes/match.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import messageRoutes from './routes/message.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middlewares globales
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(config.uploadPath));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TOURNEX API is running',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Manejadores de errores
app.use(notFound);
app.use(errorHandler);

export default app;
