import express from 'express';
import {
  getAllProduct,
  getSpecificProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getRentableProducts,
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
  .get(getSpecificProduct)
  .delete(protectedRoutes, deleteProduct)
  .put(
    protectedRoutes,
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'imageCover', maxCount: 1 },
    ]),
    updateProduct
  );

productRouter.get('/rentable', getRentableProducts);

export default productRouter;
