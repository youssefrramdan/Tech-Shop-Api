import authRouter from "../auth/auth.routes.js";
import { orderRouter } from "../order/order.routes.js";
import brandRouter from "./brand/brand.routes.js";
import { cartRouter } from "./cart/cart.routes.js";
import categoryRouter from "./category/category.routes.js";
import { couponRouter } from "./coupon/coupon.routes.js";
import productRouter from "./product/product.routes.js";
import subCategoryRouter from "./subcategory/subcategory.routes.js";
import userRouter from "./user/user.routes.js";

export const bootstrap = (app) => {
  app.use("/api/categories", categoryRouter);
  app.use("/api/subcategories", subCategoryRouter);
  app.use("/api/brand", brandRouter);
  app.use("/api/products", productRouter);
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/coupons" ,couponRouter)
  app.use("/api/carts" ,cartRouter)
  app.use("/api/orders" ,orderRouter)
};
