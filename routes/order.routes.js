import { Router } from 'express';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';
import adminOnly from '../middlewares/admin.middleware.js';
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

// Get all orders (admin) - must be before /:orderId
orderRouter.get('/', protectedRoutes, adminOnly, getAllOrders);

// Get user orders
orderRouter.get('/user', protectedRoutes, getUserOrders);

// Update order status (admin) - must be before /:orderId
orderRouter.patch(
  '/:orderId/status',
  protectedRoutes,
  adminOnly,
  updateOrderStatus
);

// Update order (admin) - for general updates
orderRouter.patch('/:orderId', protectedRoutes, adminOnly, updateOrderStatus);

// Get single order - must be last
orderRouter.get('/:orderId', protectedRoutes, getOrderById);

export { orderRouter };
