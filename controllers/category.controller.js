import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import Category from '../models/Category.model.js';
import ApiError from '../utils/apiError.js';

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res, next) => {
  // Handle image upload
  if (req.file) {
    req.body.imageCover = req.file.path;
  } else {
    return next(new ApiError('Category image is required', 400));
  }

  // Create slug from name
  req.body.slug = slugify(req.body.name);

  // Create category
  const category = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: category,
  });
});

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: categories,
  });
});

/**
 * @desc    Get specific category
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ApiError('Category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ApiError('Category not found', 404));
  }

  // Handle image upload if new file is provided
  if (req.file) {
    req.body.imageCover = req.file.path;
  }

  // Update slug if name is provided
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }

  // Update category
  Object.assign(category, req.body);
  await category.save();

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new ApiError('Category not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
