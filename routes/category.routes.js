import express from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';
import subCategoryRouter from './subcategory.routes.js';

const categoryRouter = express.Router();

categoryRouter.use('/:categoryId/subcategories', subCategoryRouter);
const upload = createUploader();
// Public routes
categoryRouter.get('/', getCategories);
categoryRouter.get('/:id', getCategory);

categoryRouter.use(protectedRoutes);

categoryRouter.route('/').post(upload.single('imageCover'),createCategory);

categoryRouter
  .route('/:id')
  .put(upload.single('imageCover'), updateCategory)
  .delete(deleteCategory);

export default categoryRouter;
