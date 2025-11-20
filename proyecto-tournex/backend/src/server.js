import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';

// Conectar a la base de datos
connectDB();

// Crear servidor HTTP
const httpServer = createServer(app);

// Inicializar Socket.IO
const io = initializeSocket(httpServer);

// Iniciar servidor
const PORT = config.port;

httpServer.listen(PORT, () => {
  console.log(`🚀 TOURNEX Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO initialized`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  io.close();
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  io.close();
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
