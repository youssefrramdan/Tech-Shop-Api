import express from 'express';
import {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller.js';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';

const upload = createUploader();
const brandRouter = express.Router();

// Public routes
brandRouter.get('/', getBrands);
brandRouter.get('/:id', getBrand);

// Protected routes (Admin only)
brandRouter.use(protectedRoutes);
// router.use(allowTo('admin'));

brandRouter.route('/').post(upload.single('logo'), createBrand);

brandRouter
  .route('/:id')
  .put(upload.single('logo'), updateBrand)
  .delete(deleteBrand);

export default brandRouter;
