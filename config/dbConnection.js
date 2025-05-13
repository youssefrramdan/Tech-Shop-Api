import mongoose from 'mongoose';
import logger from './loger.config.js';

const databaseConnection = async () => {
  mongoose
    .connect(process.env.DB_URI)
    .then(conn => {
      logger.info(`Database connected : ${conn.connection.host}`);
    })
    .catch(error => {
      logger.error(`Database error : ${error}`);
    });
};

export default databaseConnection;
