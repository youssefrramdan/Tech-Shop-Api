import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import Brand from '../models/Brand.model.js';
import ApiError from '../utils/apiError.js';

/**
 * @desc    Create new brand
 * @route   POST /api/brands
 * @access  Private/Admin
 */
const createBrand = asyncHandler(async (req, res, next) => {
  // Handle logo upload
  if (req.file) {
    req.body.logo = req.file.path;
  }

  // Create slug from name
  req.body.slug = slugify(req.body.name);

  // Create brand
  const brand = await Brand.create(req.body);

  res.status(201).json({
    status: 'success',
    data: brand,
  });
});

/**
 * @desc    Get all brands
 * @route   GET /api/brands
 * @access  Public
 */
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();

  res.status(200).json({
    status: 'success',
    results: brands.length,
    data: brands,
  });
});

/**
 * @desc    Get specific brand
 * @route   GET /api/brands/:id
 * @access  Public
 */
const getBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ApiError('Brand not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: brand,
  });
});

/**
 * @desc    Update brand
 * @route   PUT /api/brands/:id
 * @access  Private/Admin
 */
const updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ApiError('Brand not found', 404));
  }

  // Handle logo upload if new file is provided
  if (req.file) {
    req.body.logo = req.file.path;
  }

  // Update slug if name is provided
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }

  // Update brand
  Object.assign(brand, req.body);
  await brand.save();

  res.status(200).json({
    status: 'success',
    data: brand,
  });
});

/**
 * @desc    Delete brand
 * @route   DELETE /api/brands/:id
 * @access  Private/Admin
 */
const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    return next(new ApiError('Brand not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export { createBrand, getBrands, getBrand, updateBrand, deleteBrand };
