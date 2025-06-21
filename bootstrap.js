import authRouter from './routes/auth.routes.js';
import brandRouter from './routes/brand.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import subCategoryRouter from './routes/subcategory.routes.js';
import userRouter from './routes/user.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';

const bootstrap = app => {
  app.use('/api/v1/subcategories', subCategoryRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/brand', brandRouter);
  app.use('/api/v1/wishlist', wishlistRouter);
  //   app.use("/api/coupons" ,couponRouter)
  app.use('/api/cart', cartRouter);
  //   app.use("/api/orders" ,orderRouter)
};

export default bootstrap;
