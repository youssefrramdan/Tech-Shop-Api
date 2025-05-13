import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import userRouter from './routes/user.routes.js';

const bootstrap = app => {
  //   app.use("/api/subcategories", subCategoryRouter);
  //   app.use("/api/brand", brandRouter);
  app.use('/api/products', productRouter);
  app.use('/api/users', userRouter);
  app.use('/api/auth', authRouter);
  //   app.use("/api/coupons" ,couponRouter)
  //   app.use("/api/carts" ,cartRouter)
  //   app.use("/api/orders" ,orderRouter)
};

export default bootstrap;
