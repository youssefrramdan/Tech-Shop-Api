import express from 'express';
import { protectedRoutes } from '../controllers/auth.controller.js';
import adminOnly from '../middlewares/admin.middleware.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
} from '../controllers/user.controller.js';
import {
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/order.controller.js';
import {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} from '../controllers/product.controller.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';

const router = express.Router();
const upload = createUploader('products');

// Protect all routes
router.use(protectedRoutes);
router.use(adminOnly);

// Dashboard Overview
router.get('/stats/orders', getOrderStats);
router.get('/stats/products', getProductStats);

// Users Management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// Orders Management
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Products Management
router
  .route('/products')
  .get(getAllProduct)
  .post(
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'imageCover', maxCount: 1 },
    ]),
    createProduct
  );

router
  .route('/products/:id')
  .patch(
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'imageCover', maxCount: 1 },
    ]),
    updateProduct
  )
  .delete(deleteProduct);

// Categories Management
router.route('/categories').get(getCategories).post(createCategory);

router.route('/categories/:id').patch(updateCategory).delete(deleteCategory);

export default router;
