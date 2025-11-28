import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler, notFound } from './utils/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import tournamentRoutes from './routes/tournament.routes.js';
import matchRoutes from './routes/match.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middlewares globales
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Manejadores de errores
app.use(notFound);
app.use(errorHandler);

export default app;
