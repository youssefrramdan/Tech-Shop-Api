import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  updateProduct,
} from '../controllers/product.controller.js';
import { protectedRoutes } from '../controllers/auth.controller.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';

const productRouter = express.Router();
const upload = createUploader();
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
  .delete(protectedRoutes, deleteProduct)
  .put(
    protectedRoutes,
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'imageCover', maxCount: 1 },
    ]),
    updateProduct
  );

export default productRouter;
