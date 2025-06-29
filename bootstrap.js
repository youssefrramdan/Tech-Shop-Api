import authRouter from './routes/auth.routes.js';
import brandRouter from './routes/brand.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import subCategoryRouter from './routes/subcategory.routes.js';
import userRouter from './routes/user.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import { cartRouter } from './routes/cart.routes.js';
import { orderRouter } from './routes/order.routes.js';
import adminRouter from './routes/admin.routes.js';
import rentalRequestRouter from './routes/rentalRequest.routes.js';
import express from 'express';

const bootstrap = app => {
  // API routes
  const apiRouter = express.Router();
  app.use('/api/v1', apiRouter);

  // Mount all routes under /api/v1
  apiRouter.use('/products', productRouter);
  apiRouter.use('/categories', categoryRouter);
  apiRouter.use('/subcategories', subCategoryRouter);
  apiRouter.use('/users', userRouter);
  apiRouter.use('/auth', authRouter);
  apiRouter.use('/brands', brandRouter);
  apiRouter.use('/wishlist', wishlistRouter);
  apiRouter.use('/cart', cartRouter);
  apiRouter.use('/orders', orderRouter);
  apiRouter.use('/admin', adminRouter);
  apiRouter.use('/rental-requests', rentalRequestRouter);
  //   app.use("/api/coupons" ,couponRouter)
};

export default bootstrap;
