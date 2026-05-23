import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth';
import { projectsRouter } from './routes/projects';
import { artworksRouter } from './routes/artworks';
import { framesRouter } from './routes/frames';
import { recommendationsRouter } from './routes/recommendations';
import { marketplaceRouter } from './routes/marketplace';
import { uploadRouter } from './routes/upload';
import { collabRouter } from './routes/collab';
import { setupSocketHandlers } from './socket/collabHandlers';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ML endpoints get a more generous rate limit
const mlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});
app.use('/api/ml/', mlLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (all public access - no auth required)
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/artworks', artworksRouter);
app.use('/api/frames', framesRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/collab', collabRouter);

// Socket.IO handlers
setupSocketHandlers(io);

// Error handling
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '4000', 10);
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, io };
