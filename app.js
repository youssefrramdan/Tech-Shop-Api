import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import globalError from './middlewares/errorMiddleware.js';
import ApiError from './utils/apiError.js';
import bootstrap from './bootstrap.js';
import logger from './config/loger.config.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config({ path: './config/config.env' });

const app = express();

// Trust proxy - Required for Heroku deployment
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

const corsOptions = {
  origin: [
          'http://localhost:3000',
          'https://localhost:3000',
          process.env.FRONTEND_URL || 'http://localhost:3000',
          // Add Vercel domains
          /^https:\/\/.*\.vercel\.app$/,
          /^https:\/\/fresh-cart.*\.vercel\.app$/,
        ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(compression());

// Parse JSON payloads
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  logger.info(`mode : ${process.env.NODE_ENV}`);
}

app.use(cookieParser());
bootstrap(app);

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 400));
});

// Global error
app.use(globalError);

export default app;
