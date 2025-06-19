/* eslint-disable prefer-const */
import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import ProductModel from '../models/Product.model.js';
import ApiError from '../utils/apiError.js';

// @desc     Get all products
// @route    GET /api/v1/products
// @access   Public
const getAllProduct = asyncHandler(async (req, res) => {
  // 1) Basic Filtering
  const query = { ...req.query };
  const excludesFields = [
    'page',
    'limit',
    'skip',
    'fields',
    'sort',
    'keyword',
    'price',
    'rating',
  ];
  excludesFields.forEach(field => delete query[field]);

  // 2) Advanced Filtering
  let queryStr = JSON.stringify(query);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  let filters = JSON.parse(queryStr);

  // 3) Price Range Filter
  if (req.query.price) {
    const [min, max] = req.query.price.split(',').map(Number);
    filters.price = { $gte: min, $lte: max };
  }

  // 4) Rating Filter
  if (req.query.rating) {
    filters.ratingsAverage = { $gte: parseFloat(req.query.rating) };
  }

  // 5) Search Query
  if (req.query.keyword) {
    const searchQuery = {
      $or: [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
      ],
    };
    filters = { ...filters, ...searchQuery };
  }

  // 6) Build Query
  let mongooseQuery = ProductModel.find(filters)
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'brand', select: 'name' });

  // 7) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort('-createdAt');
  }

  // 8) Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery = mongooseQuery.select('-__v');
  }

  // 9) Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  mongooseQuery = mongooseQuery.skip(skip).limit(limit);

  // 10) Execute Query
  const [products, totalProducts] = await Promise.all([
    mongooseQuery,
    ProductModel.countDocuments(filters),
  ]);

  // 11) Response
  res.status(200).json({
    status: 'success',
    results: products.length,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
    data: products,
  });
});

// @desc     Get specific product by id
// @param {String} id
// @route    GET /api/v1/products/:productId
// @access   Public
const getSpecificProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  const product = await ProductModel.findById(productId).populate({
    path: 'category',
    select: 'name -_id',
  });
  if (!product) {
    return next(new ApiError(`No product found with ID: ${productId}`, 404));
  }
  res.status(200).json({
    message: 'success',
    data: product,
  });
});

// @desc     Create a new product
// @route    POST /api/v1/products
// @access   privite
const createProduct = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  const images = [];
  if (req.files) {
    if (req.files.images) {
      req.files.images.forEach(file => {
        images.push(file.path);
      });
    }
  }
  const product = await ProductModel.create(req.body);
  res.status(200).json({
    message: 'success',
    data: product,
  });
});

// @desc     Update an existing product
// @route    PUT /api/v1/products/:productId
// @access   Private
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const images = [];
  if (req.files) {
    if (req.files.images) {
      req.files.images.forEach(file => {
        images.push(file.path);
      });
    }
  }
  const product = await ProductModel.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new ApiError(`No product found with ID: ${id}`, 404));
  }
  res.status(200).json({
    message: 'success',
    data: product,
  });
});

// @desc     Delete an existing product
// @route    DELETE /api/v1/products/:productId
// @access   Private

const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModel.findByIdAndDelete({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new ApiError(`No product found with ID: ${id}`, 404));
  }
  res.status(200).json({
    message: 'success',
    data: product,
  });
});

export {
  getAllProduct,
  getSpecificProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
