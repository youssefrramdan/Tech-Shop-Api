import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import ApiError from '../utils/apiError.js';

// Helper function to filter object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

/**
 * @desc    Get specific user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res, next) => {
  // Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    profileImage: req.body.profileImage,
  });

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    data: user,
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Handle profile image if provided
  if (req.file) {
    req.body.profileImage = req.file.path;
  }

  // Prevent password update through this route
  if (req.body.password) {
    return next(
      new ApiError(
        'This route is not for password updates. Please use /updatePassword.',
        400
      )
    );
  }

  // Update user
  Object.assign(user, req.body);
  await user.save();

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Get logged user data
 * @route   GET /api/users/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

/**
 * @desc    Update logged user password
 * @route   PUT /api/users/updateMyPassword
 * @access  Private
 */
const updateMyPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new ApiError('Your current password is incorrect', 401));
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});

/**
 * @desc    Update logged user data
 * @route   PUT /api/users/updateMe
 * @access  Private
 */
const updateMe = asyncHandler(async (req, res, next) => {
  // Prevent password update through this route
  if (req.body.password) {
    return next(
      new ApiError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // Filter unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'profileImage');

  // Handle profile image if provided
  if (req.file) {
    filteredBody.profileImage = req.file.path;
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

export {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  updateMyPassword,
};
