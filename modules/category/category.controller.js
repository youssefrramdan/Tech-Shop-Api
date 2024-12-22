
import { catchError } from "../../middlewares/catchError.js";
import { Category } from "../../models/Category.model.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";
import { deleteOne } from "../handlers/handlers.js";
import { cloudinaryUploadImage } from "../../fileUpload/fileUpload.js";

const addCategory = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });

  // رفع صورة الغلاف
  if (req.file) {
    const imageCoverUpload = await cloudinaryUploadImage(req.file.buffer);
    req.body.imageCover = imageCoverUpload.secure_url;
  } else {
    return next(new AppError("Image cover is required", 400));
  }

  const category = new Category(req.body);
  await category.save();

  res.json({ message: "success", category });
});

const getAllCategories = catchError(async (req, res, next) => {
  const categories = await Category.find();
  res.json({ message: "success", categories });
});

const getSpecificCategory = catchError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.json({ message: "success", category });
});

const updateCategory = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });

  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  if (req.file) {
    const imageCoverUpload = await cloudinaryUploadImage(req.file.buffer);
    req.body.imageCover = imageCoverUpload.secure_url;
  }

  Object.assign(category, req.body); // تحديث الحقول
  await category.save(); // حفظ التحديثات

  res.json({ message: "Category updated successfully", category });
});

const deleteCategory = deleteOne(Category);

export {
  addCategory,
  getAllCategories,
  getSpecificCategory,
  updateCategory,
  deleteCategory,
}
