import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';
import Rental from '../models/Rental.model.js';
import Product from '../models/Product.model.js';

// @desc    Create new rental
// @route   POST /api/v1/rentals
// @access  Protected/User
export const createRental = asyncHandler(async (req, res) => {
  const { productId, startDate, endDate } = req.body;

  // Check if product exists and is available for rent
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError('Product not found', 404);
  }
  if (!product.isRentable) {
    throw new ApiError('This product is not available for rent', 400);
  }
  if (product.availableForRent < 1) {
    throw new ApiError(
      'This product is currently out of stock for rental',
      400
    );
  }

  // Create rental
  const rental = await Rental.create({
    user: req.user._id,
    product: productId,
    startDate,
    endDate,
  });

  // Decrease available rental stock
  await Product.findByIdAndUpdate(productId, {
    $inc: { availableForRent: -1 },
  });

  res.status(201).json({
    status: 'success',
    data: rental,
  });
});

// @desc    Get all rentals
// @route   GET /api/v1/rentals
// @access  Protected/Admin
export const getRentals = asyncHandler(async (req, res) => {
  const rentals = await Rental.find();

  res.status(200).json({
    status: 'success',
    results: rentals.length,
    data: rentals,
  });
});

// @desc    Get user rentals
// @route   GET /api/v1/rentals/my-rentals
// @access  Protected/User
export const getMyRentals = asyncHandler(async (req, res) => {
  const rentals = await Rental.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: rentals.length,
    data: rentals,
  });
});

// @desc    Get single rental
// @route   GET /api/v1/rentals/:id
// @access  Protected/User
export const getRental = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) {
    throw new ApiError('No rental found with that ID', 404);
  }

  // Check if the rental belongs to the user or if the user is admin
  if (
    rental.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new ApiError('You are not authorized to access this rental', 403);
  }

  res.status(200).json({
    status: 'success',
    data: rental,
  });
});

// @desc    Update rental status
// @route   PATCH /api/v1/rentals/:id/status
// @access  Protected/Admin
export const updateRentalStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const rental = await Rental.findById(req.params.id);
  if (!rental) {
    throw new ApiError('No rental found with that ID', 404);
  }

  // If rental is being cancelled or completed, increase available rental stock
  if (
    (status === 'cancelled' || status === 'completed') &&
    rental.status === 'active'
  ) {
    await Product.findByIdAndUpdate(rental.product._id, {
      $inc: { availableForRent: 1 },
    });
  }

  rental.status = status;
  await rental.save();

  res.status(200).json({
    status: 'success',
    data: rental,
  });
});

// @desc    Update rental payment status
// @route   PATCH /api/v1/rentals/:id/payment
// @access  Protected/Admin
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const rental = await Rental.findByIdAndUpdate(
    req.params.id,
    { paymentStatus },
    { new: true }
  );

  if (!rental) {
    throw new ApiError('No rental found with that ID', 404);
  }

  res.status(200).json({
    status: 'success',
    data: rental,
  });
});
