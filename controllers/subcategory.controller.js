import asyncHandler from 'express-async-handler';
import SubCategoryModel from '../models/SubCategory.model.js';
import ApiError from '../utils/apiError.js';
import CategoryModel from '../models/Category.model.js';

const createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

const setCategoryIdToBody = (req, res, next) => {
  // Nested route (Create)
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @desc    Create new subcategory
// @route   POST /api/v1/subcategories
// @access  Private/Admin
const createSubCategory = asyncHandler(async (req, res, next) => {
  const category = await CategoryModel.find(req.body.category);
  if (category) {
    return next(
      new ApiError(`No subcategory for this id ${req.body.category}`, 404)
    );
  }
  const subCategory = await SubCategoryModel.create(req.body);
  res.status(201).json({
    message: 'success',
    data: subCategory,
  });
});

// @desc    Get all subcategories
// @route   GET /api/v1/subcategories
// @access  Public
const getAllSubCategories = asyncHandler(async (req, res) => {
  const filterObject = req.filterObject || {};
  const subCategories =
    await SubCategoryModel.find(filterObject).populate('category');
  res.status(200).json({
    message: 'success',
    data: subCategories,
  });
});

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
const getSpecificSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategoryModel.findById(id).populate('category');

  if (!subCategory) {
    return next(new ApiError(`No subcategory for this id ${id}`, 404));
  }

  res.status(200).json({
    message: 'success',
    data: subCategory,
  });
});

// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private/Admin
const updateSpecificSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!subCategory) {
    return next(new ApiError(`No subcategory for this id ${id}`, 404));
  }

  res.status(200).json({
    message: 'success',
    data: subCategory,
  });
});

// @desc    Delete specific subcategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private/Admin
const deleteSpecificSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategoryModel.findByIdAndDelete(id);

  if (!subCategory) {
    return next(new ApiError(`No subcategory for this id ${id}`, 404));
  }

  res.status(204).json({
    message: 'success',
    data: subCategory,
  });
});

export {
  createFilterObj,
  setCategoryIdToBody,
  createSubCategory,
  getAllSubCategories,
  getSpecificSubCategory,
  updateSpecificSubCategory,
  deleteSpecificSubCategory,
};
