import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { Coupon } from '../models/Coupon.model.js';

const calcTotalCartPrice = cart => {
  let totalPrice = 0;
  cart.cartItems.forEach(item => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check if product is in stock
  if (product.stock < quantity) {
    return next(new ApiError('Insufficient stock', 400));
  }

  // Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          price: product.priceAfterDiscount || product.price,
          quantity: quantity,
        },
      ],
    });
  } else {
    // Check if product exists in cart
    const productIndex = cart.cartItems.findIndex(
      item => item.product.toString() === productId
    );

    if (productIndex > -1) {
      // Product exists, update quantity
      const newQuantity = cart.cartItems[productIndex].quantity + quantity;

      // Check total stock
      if (product.stock < newQuantity) {
        return next(new ApiError('Insufficient stock', 400));
      }

      cart.cartItems[productIndex].quantity = newQuantity;
      cart.cartItems[productIndex].price =
        product.priceAfterDiscount || product.price;
    } else {
      // Product doesn't exist in cart, add it
      cart.cartItems.push({
        product: productId,
        price: product.priceAfterDiscount || product.price,
        quantity: quantity,
      });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  // Populate the cart for response
  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'cartItems.product',
    select:
      'name title imageCover brand category price priceAfterDiscount stock ratingsAverage description',
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

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    numOfCartItems: populatedCart.cartItems.length,
    data: populatedCart,
  });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private
export const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'cartItems.product',
    select:
      'name title imageCover brand category price priceAfterDiscount stock ratingsAverage description',
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

  if (!cart) {
    // Return empty cart instead of error
    return res.status(200).json({
      status: 'success',
      numOfCartItems: 0,
      data: {
        cartItems: [],
        totalCartPrice: 0,
        user: req.user._id,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
export const updateProductQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new ApiError('Quantity must be at least 1', 400));
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'cartItems.product',
    select: 'stock price priceAfterDiscount',
  });

  if (!cart) {
    return next(new ApiError(`There is no cart for user ${req.user._id}`, 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    item => item._id.toString() === req.params.id
  );

  if (itemIndex === -1) {
    return next(
      new ApiError(`There is no item for this id: ${req.params.id}`, 404)
    );
  }

  const product = cart.cartItems[itemIndex].product;

  // Check stock availability
  if (product.stock < quantity) {
    return next(new ApiError('Insufficient stock', 400));
  }

  // Update quantity and price (in case price changed)
  cart.cartItems[itemIndex].quantity = quantity;
  cart.cartItems[itemIndex].price = product.priceAfterDiscount || product.price;

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  // Re-populate for response
  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'cartItems.product',
    select:
      'name title imageCover brand category price priceAfterDiscount stock ratingsAverage description',
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

  res.status(200).json({
    status: 'success',
    numOfCartItems: updatedCart.cartItems.length,
    data: updatedCart,
  });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
export const removeItemFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.id } },
    },
    { new: true }
  ).populate({
    path: 'cartItems.product',
    select:
      'name title imageCover brand category price priceAfterDiscount stock ratingsAverage description',
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

  if (!cart) {
    return next(new ApiError(`There is no cart for user ${req.user._id}`, 404));
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private
export const clearUserCart = asyncHandler(async (req, res, next) => {
  const result = await Cart.findOneAndDelete({ user: req.user._id });

  if (!result) {
    return next(new ApiError(`There is no cart for user ${req.user._id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully',
  });
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { coupon: couponCode } = req.body;

  if (!couponCode) {
    return next(new ApiError('Coupon code is required', 400));
  }

  // Get coupon based on coupon code
  const coupon = await Coupon.findOne({
    code: couponCode,
    expires: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError('Coupon is invalid or expired', 400));
  }

  // Get logged user cart
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'cartItems.product',
    select:
      'name title imageCover brand category price priceAfterDiscount stock ratingsAverage description',
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

  if (!cart) {
    return next(new ApiError(`There is no cart for user ${req.user._id}`, 404));
  }

  const totalPrice = cart.totalCartPrice;

  // Calculate price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Coupon applied successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/v1/cart/applyCoupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'cartItems.product',
    select:
      'name title imageCover brand category price priceAfterDiscount stock ratingsAverage description',
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

  if (!cart) {
    return next(new ApiError(`There is no cart for user ${req.user._id}`, 404));
  }

  cart.totalPriceAfterDiscount = undefined;
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Coupon removed successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Get cart items count for logged user
// @route   GET /api/v1/cart/count
// @access  Private
export const getCartCount = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  const count = cart ? cart.cartItems.length : 0;

  res.status(200).json({
    status: 'success',
    data: {
      count: count,
    },
  });
});
