import app from './app.js';
import databaseConnection from './config/dbConnection.js';
import logger from './config/loger.config.js';

databaseConnection();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  logger.info(`server is running ${PORT} ....`);
  //   throw new Error("Error in server");
});

/**
 * Gracefully shutdown the server
 * @param {string} signal - The signal that triggered the shutdown
 */
const gracefulShutdown = signal => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  }
};

/**
 * Handle unexpected errors
 * @param {Error} error - The error that occurred
 */
const unexpectedErrorHandler = error => {
  logger.error(error);
  if (server) {
    logger.info('Server is shutting down due to unexpected error...');
    process.exit(1);
  } else {
    process.exit(1);
  }
};

// Handle errors that occur within promises but weren't caught
process.on('unhandledRejection', unexpectedErrorHandler);

// Handle errors that happen synchronously outside Express
process.on('uncaughtException', unexpectedErrorHandler);

// Handle SIGTERM signal (used by container systems)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
