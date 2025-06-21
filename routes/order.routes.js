import { Router } from 'express';
import { protectedRoutes } from '../controllers/auth.controller.js';
import {
  createCashOrder,
  createOnlinePayment,
  handleStripeWebhook,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';

const orderRouter = Router();

// Stripe webhook (before other routes)
orderRouter.post('/webhook', handleStripeWebhook);

// Create cash order
orderRouter.post('/cash/:cartId', protectedRoutes, createCashOrder);

// Create online payment session
orderRouter.post('/online/:cartId', protectedRoutes, createOnlinePayment);

// Get user orders
orderRouter.get('/user', protectedRoutes, getUserOrders);

// Get single order
orderRouter.get('/:orderId', protectedRoutes, getOrderById);

// Get all orders (admin)
orderRouter.get('/', protectedRoutes, getAllOrders);

// Update order status (admin)
orderRouter.patch('/:orderId/status', protectedRoutes, updateOrderStatus);

export { orderRouter };
