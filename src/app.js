import express from 'express';
import cors from 'cors';
import quizRoutes from './routes/quizRoutes.js';
import authRoutes from './routes/authRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import communityController from './controllers/communityController.js';
import { asyncHandler } from './middleware/errorHandler.js';

const app = express();

// CORS - allow all origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cors({
  origin: true,
  credentials: true
}));


// Body parser - parse JSON bodies
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Feed endpoints
app.get('/api/feed', authenticate, asyncHandler(communityController.getUserFeed));
app.get('/api/trending', asyncHandler(communityController.getTrendingPosts));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
