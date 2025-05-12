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
const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrand);

// Protected routes (Admin only)
router.use(protectedRoutes);
// router.use(allowTo('admin'));

router.route('/').post(upload.single('logo'), createBrand);

router
  .route('/:id')
  .put(upload.single('logo'), updateBrand)
  .delete(deleteBrand);

export default router;
