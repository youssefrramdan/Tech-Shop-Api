import express from 'express';
import {
  getAllProduct,
  getSpecificProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
} from '../controllers/product.controller.js';
import { protectedRoutes } from '../controllers/auth.controller.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';

const productRouter = express.Router();
const upload = createUploader('products');

// Featured products route (should come before /:id route)
productRouter.get('/featured', getFeaturedProducts);

// Products by category
productRouter.get('/category/:categoryId', getProductsByCategory);

productRouter
  .route('/')
  .get(getAllProduct)
  .post(
    protectedRoutes,
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'imageCover', maxCount: 1 },
    ]),
    createProduct
  );

productRouter
  .route('/:id')
  .get(getSpecificProduct)
  .delete(protectedRoutes, deleteProduct)
  .patch(
    protectedRoutes,
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'imageCover', maxCount: 1 },
    ]),
    updateProduct
  );

export default productRouter;
