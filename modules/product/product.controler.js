import { catchError } from "../../middlewares/catchError.js";
import { Product } from "../../models/Product.model.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";
import { deleteOne } from "../handlers/handlers.js";

const addProduct = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });
  req.body.imageCover = req.files.imageCover[0].filename;
  req.body.images = req.files.images.map((img) => img.filename);
  let product = new Product(req.body);
  await product.save();
  res.json({ message: "success", product });
});

const getAllProducts = catchError(async (req, res, next) => {
  let products = await Product.find();
  res.json({ message: "success", products });
});

const getSpecificProduct = catchError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  product || next(new AppError("product not found"), 404);
  !product || res.json({ message: "success", product });
});

const updateProduct = catchError(async (req, res, next) => {
  if (!req.body.name) {
    return next(new AppError("Product name is required", 400));
  }
  req.body.slug = slugify(req.body.name, { lower: true });
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  if (req.files?.imageCover) {
    req.body.imageCover = req.files.imageCover[0].filename;
  }
  if (req.files?.images) {
    req.body.images = req.files.images.map((img) => img.filename);
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

const deleteProduct = deleteOne(Product);

const pagination = catchError(async (req, res, next) => {
  // استخراج رقم الصفحة من الاستعلام وتعيين قيم افتراضية إذا لزم الأمر
  const pageNumber = req.query.page
    ? parseInt(req.query.page) < 1
      ? 1
      : parseInt(req.query.page)
    : 1;

  // استخراج الحد الأقصى من الاستعلام وتعيين قيم افتراضية
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 5; // Allow custom limit with a maximum of 100
  const skip = (pageNumber - 1) * limit;

  // احسب العدد الإجمالي للمنتجات
  const totalProducts = await Product.countDocuments();

  // احسب العدد الإجمالي للصفحات
  const totalPages = Math.ceil(totalProducts / limit);

  // تحقق مما إذا كانت رقم الصفحة أكبر من العدد الإجمالي للصفحات
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
