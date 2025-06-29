import asyncHandler from 'express-async-handler';
import RentalRequest from '../models/RentalRequest.model.js';
import Product from '../models/Product.model.js';
import ApiError from '../utils/apiError.js';

/**
 * @desc    Create new rental request
 * @route   POST /api/v1/rental-requests
 * @access  Private (User)
 */
const createRentalRequest = asyncHandler(async (req, res, next) => {
  const { productId, personalInfo, requestedStartDate, requestedEndDate } =
    req.body;

  // Check if product exists and is rentable
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  if (!product.isRentable) {
    return next(new ApiError('This product is not available for rental', 400));
  }

  if (!product.availableForRental || product.rentalStock <= 0) {
    return next(
      new ApiError('Product is not currently available for rental', 400)
    );
  }

  // Validate dates
  const startDate = new Date(requestedStartDate);
  const endDate = new Date(requestedEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate < today) {
    return next(new ApiError('Start date cannot be in the past', 400));
  }

  if (endDate <= startDate) {
    return next(new ApiError('End date must be after start date', 400));
  }

  // Calculate rental days and pricing
  const timeDiff = endDate.getTime() - startDate.getTime();
  const rentalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const dailyRate = product.rentalPricePerDay;
  const totalPrice = dailyRate * rentalDays;
  const depositAmount = product.rentalDeposit;

  // Handle image uploads
  const idCardImages = {
    front: req.files?.idCardFront?.[0]?.path,
    back: req.files?.idCardBack?.[0]?.path,
  };

  if (!idCardImages.front || !idCardImages.back) {
    return next(new ApiError('Both sides of ID card images are required', 400));
  }

  // Create rental request
  const rentalRequest = await RentalRequest.create({
    user: req.user._id,
    product: productId,
    personalInfo,
    idCardImages,
    requestedStartDate,
    requestedEndDate,
    rentalDays,
    dailyRate,
    totalPrice,
    depositAmount,
  });

  res.status(201).json({
    status: 'success',
    message: 'Rental request submitted successfully',
    data: rentalRequest,
  });
});

/**
 * @desc    Get user's rental requests
 * @route   GET /api/v1/rental-requests/my-requests
 * @access  Private (User)
 */
const getUserRentalRequests = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const rentalRequests = await RentalRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await RentalRequest.countDocuments({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: rentalRequests.length,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: rentalRequests,
  });
});

/**
 * @desc    Get all rental requests (Admin)
 * @route   GET /api/v1/rental-requests
 * @access  Private (Admin)
 */
const getAllRentalRequests = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  // Build filter
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const rentalRequests = await RentalRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await RentalRequest.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: rentalRequests.length,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: rentalRequests,
  });
});

/**
 * @desc    Get single rental request
 * @route   GET /api/v1/rental-requests/:id
 * @access  Private
 */
const getRentalRequest = asyncHandler(async (req, res, next) => {
  const rentalRequest = await RentalRequest.findById(req.params.id);

  if (!rentalRequest) {
    return next(new ApiError('Rental request not found', 404));
  }

  // Check if user owns this request or is admin
  if (
    rentalRequest.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ApiError('Not authorized to access this rental request', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: rentalRequest,
  });
});

/**
 * @desc    Update rental request status (Admin)
 * @route   PATCH /api/v1/rental-requests/:id/status
 * @access  Private (Admin)
 */
const updateRentalRequestStatus = asyncHandler(async (req, res, next) => {
  const { status, adminNotes } = req.body;
  const rentalRequestId = req.params.id;

  const rentalRequest = await RentalRequest.findById(rentalRequestId);
  if (!rentalRequest) {
    return next(new ApiError('Rental request not found', 404));
  }

  // Validate status transition
  const validStatuses = [
    'pending',
    'approved',
    'rejected',
    'active',
    'completed',
    'cancelled',
  ];
  if (!validStatuses.includes(status)) {
    return next(new ApiError('Invalid status', 400));
  }

  // Update rental request
  rentalRequest.status = status;
  rentalRequest.adminNotes = adminNotes || rentalRequest.adminNotes;

  if (status === 'approved') {
    rentalRequest.approvedBy = req.user._id;
    rentalRequest.approvedAt = new Date();
    rentalRequest.actualStartDate = rentalRequest.requestedStartDate;
    rentalRequest.actualEndDate = rentalRequest.requestedEndDate;

    // Decrease rental stock
    await Product.findByIdAndUpdate(rentalRequest.product._id, {
      $inc: { rentalStock: -1 },
    });
  } else if (status === 'rejected') {
    rentalRequest.rejectedAt = new Date();
  } else if (status === 'completed') {
    rentalRequest.returnedAt = new Date();

    // Increase rental stock back
    await Product.findByIdAndUpdate(rentalRequest.product._id, {
      $inc: { rentalStock: 1 },
    });
  }

  await rentalRequest.save();

  res.status(200).json({
    status: 'success',
    message: `Rental request ${status} successfully`,
    data: rentalRequest,
  });
});

/**
 * @desc    Update return condition and deposit (Admin)
 * @route   PATCH /api/v1/rental-requests/:id/return
 * @access  Private (Admin)
 */
const updateReturnCondition = asyncHandler(async (req, res, next) => {
  const { returnCondition, depositReturnedAmount, adminNotes } = req.body;
  const rentalRequestId = req.params.id;

  const rentalRequest = await RentalRequest.findById(rentalRequestId);
  if (!rentalRequest) {
    return next(new ApiError('Rental request not found', 404));
  }

  if (rentalRequest.status !== 'completed') {
    return next(
      new ApiError('Can only update return info for completed rentals', 400)
    );
  }

  const validConditions = ['excellent', 'good', 'fair', 'poor', 'damaged'];
  if (!validConditions.includes(returnCondition)) {
    return next(new ApiError('Invalid return condition', 400));
  }

  rentalRequest.returnCondition = returnCondition;
  rentalRequest.depositReturnedAmount = depositReturnedAmount;
  rentalRequest.depositReturned = depositReturnedAmount > 0;
  if (adminNotes) {
    rentalRequest.adminNotes = adminNotes;
  }

  await rentalRequest.save();

  res.status(200).json({
    status: 'success',
    message: 'Return information updated successfully',
    data: rentalRequest,
  });
});

/**
 * @desc    Get rental statistics (Admin)
 * @route   GET /api/v1/rental-requests/stats
 * @access  Private (Admin)
 */
const getRentalStats = asyncHandler(async (req, res, next) => {
  const stats = await RentalRequest.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  const totalRequests = await RentalRequest.countDocuments();
  const monthlyRevenue = await RentalRequest.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'active'] },
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalRequests,
      statusBreakdown: stats,
      monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
    },
  });
});

export {
  createRentalRequest,
  getUserRentalRequests,
  getAllRentalRequests,
  getRentalRequest,
  updateRentalRequestStatus,
  updateReturnCondition,
  getRentalStats,
};
