import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler, notFound } from './utils/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import commentRoutes from './routes/comment.routes.js';
import fileRoutes from './routes/file.routes.js';

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

// Manejadores de errores
app.use(notFound);
app.use(errorHandler);

export default app;
