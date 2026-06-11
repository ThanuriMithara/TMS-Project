import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger.js';
import { initSocket } from './src/sockets/socketHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'];

// Socket.IO setup
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true }
});
app.set('io', io);
initSocket(io);

// Middleware
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
import taskRoutes from './src/routes/taskRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TMS Backend is running!' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    errorCode: err.code || 'SERVER_ERROR',
    message: err.message || 'Something went wrong',
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});