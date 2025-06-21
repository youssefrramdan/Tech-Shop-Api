import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  checkInWishlist,
} from '../controllers/wishlist.controller.js';
import { protectedRoutes } from '../controllers/auth.controller.js';

const wishlistRouter = express.Router();

// Apply protection to all routes
wishlistRouter.use(protectedRoutes);

// Wishlist routes
wishlistRouter
  .route('/')
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

wishlistRouter.route('/check/:productId').get(checkInWishlist);

wishlistRouter.route('/:productId').delete(removeFromWishlist);

export default wishlistRouter;
