import { Router } from 'express';
import { protectedRoutes } from '../controllers/auth.controller.js';
import {
  createCashOrder,
  createOnlinePayment,
  verifyPaymentSuccess,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';

const orderRouter = Router();

// Note: Webhook is handled directly in app.js before other middleware

// Verify payment success (fallback method)
orderRouter.get(
  '/verify-payment/:sessionId',
  protectedRoutes,
  verifyPaymentSuccess
);

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
