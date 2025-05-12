import express from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.use(protectedRoutes);
router.use(allowTo('admin'));

router.route('/').post(uploadSingleImage('imageCover'), createCategory);

router
  .route('/:id')
  .put(uploadSingleImage('imageCover'), updateCategory)
  .delete(deleteCategory);

export default router;
