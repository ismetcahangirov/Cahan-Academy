import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';
import courseRoutes from './routes/course.routes.js';
import categoryRoutes from './routes/category.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import postRoutes from './routes/post.routes.js';
import leadRoutes from './routes/lead.routes.js';
import contactRoutes from './routes/contact.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import faqRoutes from './routes/faq.routes.js';
import teamMemberRoutes from './routes/teamMember.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { getHealth } from './controllers/health.controller.js';

const app = express();

// Vercel terminates TLS and sets X-Forwarded-For (one proxy hop). Without this, req.ip is the
// proxy address, so every visitor shared one rate-limit bucket (3 leads/hour for the whole site).
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  // Localhost is only trusted outside production (with credentials: true, a page served from a
  // visitor's localhost could otherwise call the production API with their admin cookie).
  origin: [
    ...(env.NODE_ENV === 'production' ? [] : ['http://localhost:3000']),
    'https://cahan-academy.vercel.app',
    env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
// Blog posts carry the largest bodies (3 locales of HTML); everything else is tiny.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// Health Check
app.get('/api/health', getHealth);

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/blog', postRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/team', teamMemberRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
