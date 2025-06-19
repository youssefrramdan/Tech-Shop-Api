/* eslint-disable prefer-const */
import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import ProductModel from '../models/Product.model.js';
import ApiError from '../utils/apiError.js';

// @desc     Get all products with advanced filtering
// @route    GET /api/v1/products
// @access   Public
const getAllProduct = asyncHandler(async (req, res) => {
  // 1) Build query object
  let queryObj = { ...req.query };

  // Exclude fields that are not for filtering
  const excludeFields = ['sort', 'fields', 'keyword', 'search'];
  excludeFields.forEach(field => delete queryObj[field]);

  // 2) Advanced filtering (gte, gt, lte, lt)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);
  queryObj = JSON.parse(queryStr);

  // 3) Build mongoose query
  let mongooseQuery = ProductModel.find(queryObj);

  // 4) Search functionality
  if (req.query.keyword || req.query.search) {
    const searchTerm = req.query.keyword || req.query.search;
    const searchQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
    };
    mongooseQuery = ProductModel.find(searchQuery);
  }

  // 5) Filter by category
  if (req.query.category) {
    mongooseQuery = mongooseQuery.find({ category: req.query.category });
  }

  // 6) Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    const priceFilter = {};
    if (req.query.minPrice) {
      priceFilter.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      priceFilter.$lte = parseFloat(req.query.maxPrice);
    }
    mongooseQuery = mongooseQuery.find({ price: priceFilter });
  }

  // 7) Filter by rating
  if (req.query.minRating) {
    mongooseQuery = mongooseQuery.find({
      ratingsAverage: { $gte: parseFloat(req.query.minRating) },
    });
  }

  // 8) Filter by availability/stock
  if (req.query.inStock === 'true') {
    mongooseQuery = mongooseQuery.find({ stock: { $gt: 0 } });
  } else if (req.query.inStock === 'false') {
    mongooseQuery = mongooseQuery.find({ stock: { $lte: 0 } });
  }

  // 9) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort('-createdAt');
  }

  // 10) Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery = mongooseQuery.select('-__v');
  }

  // 11) Populate category information
  mongooseQuery = mongooseQuery.populate({
    path: 'category',
    select: 'name',
  });

  // Execute query
  const products = await mongooseQuery;

  // Response
  res.status(200).json({
    message: 'success',
    results: products.length,
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
    select: 'name',
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
  req.body.slug = slugify(req.body.name || req.body.title);
  const images = [];
  if (req.files) {
    if (req.files.images) {
      req.files.images.forEach(file => {
        images.push(file.path);
      });
    }
    if (req.files.imageCover) {
      req.body.imageCover = req.files.imageCover[0].path;
    }
    if (images.length > 0) {
      req.body.images = images;
    }
  }
  const product = await ProductModel.create(req.body);
  res.status(201).json({
    message: 'success',
    data: product,
  });
});

// @desc     Update an existing product
// @route    PUT /api/v1/products/:productId
// @access   Private
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.name || req.body.title) {
    req.body.slug = slugify(req.body.name || req.body.title);
  }

  const images = [];
  if (req.files) {
    if (req.files.images) {
      req.files.images.forEach(file => {
        images.push(file.path);
      });
      req.body.images = images;
    }
    if (req.files.imageCover) {
      req.body.imageCover = req.files.imageCover[0].path;
    }
  }

  const product = await ProductModel.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: 'category',
    select: 'name',
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
  const product = await ProductModel.findByIdAndDelete({ _id: id });
  if (!product) {
    return next(new ApiError(`No product found with ID: ${id}`, 404));
  }
  res.status(204).json({
    message: 'Product deleted successfully',
  });
});

// @desc     Get products by category
// @route    GET /api/v1/products/category/:categoryId
// @access   Public
const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  const products = await ProductModel.find({ category: categoryId })
    .populate({
      path: 'category',
      select: 'name',
    })
    .sort('-createdAt');

  res.status(200).json({
    message: 'success',
    results: products.length,
    data: products,
  });
});

// @desc     Get featured products
// @route    GET /api/v1/products/featured
// @access   Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;

  const products = await ProductModel.find({
    $or: [{ ratingsAverage: { $gte: 4 } }, { stock: { $gt: 50 } }],
  })
    .populate({
      path: 'category',
      select: 'name',
    })
    .limit(limit)
    .sort('-ratingsAverage -createdAt');

  res.status(200).json({
    message: 'success',
    results: products.length,
    data: products,
  });
});

export {
  getAllProduct,
  getSpecificProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
};
