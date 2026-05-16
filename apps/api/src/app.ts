import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { globalErrorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://cahan-academy.vercel.app',
    'https://cahan-academy-git-feature-m16-legal-ismetcahangirovs-projects.vercel.app', // Test üçün PR linki
    env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

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
app.use(globalErrorHandler);

export default app;
