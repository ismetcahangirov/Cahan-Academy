import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';
import courseRoutes from './routes/course.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import postRoutes from './routes/post.routes.js';
import leadRoutes from './routes/lead.routes.js';
import contactRoutes from './routes/contact.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import faqRoutes from './routes/faq.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { getHealth } from './controllers/health.controller.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://cahan-academy.vercel.app',
    env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', getHealth);

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/blog', postRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faqs', faqRoutes);

// Error Handling
app.use(globalErrorHandler);

export default app;
