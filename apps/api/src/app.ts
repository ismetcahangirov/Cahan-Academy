import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalErrorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';
import courseRoutes from './routes/course.routes.js';
import teacherRoutes from './routes/teacher.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin:      env.CLIENT_URL,
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/teachers', teacherRoutes);

// Error Handling
app.use(globalErrorHandler);

export default app;
