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

dotenv.config({ path: './config/config.env' });

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(compression());

// middlewares
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  logger.info(`mode : ${process.env.NODE_ENV}`);
}

app.use(cookieParser());
bootstrap(app);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 400));
});

// Global error
app.use(globalError);

export default app;
