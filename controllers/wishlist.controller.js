import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import ApiError from '../utils/apiError.js';

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist
 * @access  Private
 */
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Add product to wishlist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: { product: productId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product added to wishlist successfully',
    data: {
      wishlist: user.wishlist,
    },
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: { product: productId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product removed from wishlist successfully',
    data: {
      wishlist: user.wishlist,
    },
  });
});

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
const getWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist.product',
    select:
      'title price priceAfterDiscount imageCover ratingsAverage category brand stock',
    populate: [
      {
        path: 'category',
        select: 'name',
      },
      {
        path: 'brand',
        select: 'name',
      },
    ],
  });

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: {
      wishlist: user.wishlist,
    },
  });
});

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/v1/wishlist
 * @access  Private
 */
const clearWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { wishlist: [] },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Wishlist cleared successfully',
    data: {
      wishlist: user.wishlist,
    },
  });
});

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/v1/wishlist/check/:productId
 * @access  Private
 */
const checkInWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  const isInWishlist = user.wishlist.some(
    item => item.product.toString() === productId
  );

  res.status(200).json({
    status: 'success',
    data: {
      isInWishlist,
    },
  });
});

export {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  checkInWishlist,
};
