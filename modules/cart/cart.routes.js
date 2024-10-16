import { Router } from "express";
import { protectedRoutes } from "../../auth/auth.controller.js";
import { addToCart , updateProductQuantity,removeItemFromCart , getLoggedUser ,clearUserCart ,applyCoupon} from "./cart.controller.js";

const cartRouter = Router();
cartRouter.route("/").post(protectedRoutes,addToCart).get(protectedRoutes,getLoggedUser).delete(protectedRoutes,clearUserCart)
cartRouter.route("/:id").put(protectedRoutes ,updateProductQuantity).delete(protectedRoutes,removeItemFromCart)
cartRouter.route("/apply-coupon").post(protectedRoutes,applyCoupon )
export {
  cartRouter
}