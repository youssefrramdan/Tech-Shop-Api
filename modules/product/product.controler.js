import { catchError } from "../../middlewares/catchError.js";
import { Product } from "../../models/Product.model.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";
import { deleteOne } from "../handlers/handlers.js";

import { cloudinaryUploadImage } from "../../fileUpload/fileUpload.js"; 

const addProduct = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });

  if (req.files.imageCover) {
    const imageCoverUpload = await cloudinaryUploadImage(req.files.imageCover[0].buffer); 
    req.body.imageCover = imageCoverUpload.secure_url; 
  }

 if (req.files.images) {
    req.body.images = [];
    for (const img of req.files.images) {
      const uploadedImage = await cloudinaryUploadImage(img.buffer); 
      req.body.images.push(uploadedImage.secure_url); 
    }
  }

  const product = new Product(req.body);
  await product.save();

  res.json({ message: "success", product });
});


const getAllProducts = catchError(async (req, res, next) => {
  const products = await Product.find()
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'subcategory', select: 'name' });

  res.json({ message: "success", products });
});

const getSpecificProduct = catchError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  
  res.json({ message: "success", product });
});
const updateProduct = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (req.files?.imageCover) {
    const imageCoverUpload = await cloudinaryUploadImage(req.files.imageCover[0].buffer);
    req.body.imageCover = imageCoverUpload.secure_url; 
  }

  if (req.files?.images) {
    req.body.images = [];
    for (const img of req.files.images) {
      const uploadedImage = await cloudinaryUploadImage(img.buffer);
      req.body.images.push(uploadedImage.secure_url);
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({ message: "Product updated successfully", product: updatedProduct });
});

const deleteProduct = deleteOne(Product);

const pagination = catchError(async (req, res, next) => {
  const pageNumber = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 5;
  const skip = (pageNumber - 1) * limit;

  const totalProducts = await Product.countDocuments();
  const totalPages = Math.ceil(totalProducts / limit);

  if (pageNumber > totalPages && totalPages > 0) {
    return res.status(400).json({
      message: "Invalid page number",
      currentPage: pageNumber,
      totalPages,
    });
  }

  const products = await Product.find().skip(skip).limit(limit);

  return res.json({
    message: "success",
    products,
    totalProducts,
    totalPages,
    limit,
  });
});

export {
  addProduct,
  getAllProducts,
  getSpecificProduct,
  deleteProduct,
  updateProduct,
  pagination,
};
