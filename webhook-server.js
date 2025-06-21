import express from 'express';
import dotenv from 'dotenv';
import databaseConnection from './config/dbConnection.js';
import { handleStripeWebhook } from './controllers/order.controller.js';

dotenv.config({ path: './config/config.env' });

// Connect to database
databaseConnection();

const app = express();

// Webhook endpoint with raw body parser
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Webhook server is running' });
});

const PORT = process.env.WEBHOOK_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎯 Webhook server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`For Heroku: https://your-app-name.herokuapp.com/webhook`);
});

export default app;
