import { Router } from "express";
import { protectedRoutes } from "../controllers/auth.controller.js";
import {
  addToCart,
  updateProductQuantity,
  removeItemFromCart,
  getLoggedUser,
  clearUserCart,
  applyCoupon,
} from "../controllers/cart/cart.controller.js";

const cartRouter = Router();
cartRouter
  .route("/")
  .post(protectedRoutes, addToCart)
  .get(protectedRoutes, getLoggedUser)
  .delete(protectedRoutes, clearUserCart);
cartRouter
  .route("/:id")
  .put(protectedRoutes, updateProductQuantity)
  .delete(protectedRoutes, removeItemFromCart);
cartRouter.route("/apply-coupon").post(protectedRoutes, applyCoupon);
export { cartRouter };
