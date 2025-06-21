import { Router } from 'express';
import { protectedRoutes } from '../controllers/auth.controller.js';
import {
  addToCart,
  updateProductQuantity,
  removeItemFromCart,
  getLoggedUserCart,
  clearUserCart,
  applyCoupon,
  removeCoupon,
  getCartCount,
} from '../controllers/cart.controller.js';
import {
  addToCartValidator,
  updateCartItemValidator,
  removeCartItemValidator,
  applyCouponValidator,
} from '../utils/validators/cartValidator.js';

const cartRouter = Router();

// Cart count
cartRouter.route('/count').get(protectedRoutes, getCartCount);

// Cart CRUD operations
cartRouter
  .route('/')
  .post(protectedRoutes, addToCartValidator, addToCart)
  .get(protectedRoutes, getLoggedUserCart)
  .delete(protectedRoutes, clearUserCart);

// Cart item operations
cartRouter
  .route('/:id')
  .put(protectedRoutes, updateCartItemValidator, updateProductQuantity)
  .delete(protectedRoutes, removeCartItemValidator, removeItemFromCart);

// Coupon operations
cartRouter
  .route('/apply-coupon')
  .post(protectedRoutes, applyCouponValidator, applyCoupon)
  .delete(protectedRoutes, removeCoupon);

export { cartRouter };
