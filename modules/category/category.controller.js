import { catchError } from "../../middlewares/catchError.js";
import { Category } from "../../models/Category.model.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";
import { deleteOne, updateOne } from "../handlers/handlers.js";
import { cloudinaryUploadImage } from "../../fileUpload/fileUpload.js"; 

const addCategory = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });

  // Handle category image upload
  if (req.files?.image) {
    const imageUpload = await cloudinaryUploadImage(req.files.image[0].buffer);
    req.body.image = imageUpload.secure_url;
  }

  let category = new Category(req.body);
  await category.save();

  res.json({ message: "success", category });
});

const getAllCategories = catchError(async (req, res, next) => {
  let categories = await Category.find();
  res.json({ message: "success", categories });
});

const getSpecificCategory = catchError(async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }
  res.json({ message: "success", category });
});

const updateCategory = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });

  let category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // Handle image upload if provided
  if (req.files?.image) {
    const imageUpload = await cloudinaryUploadImage(req.files.image[0].buffer);
    req.body.image = imageUpload.secure_url;
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({ message: "Category updated successfully", category: updatedCategory });
});

const deleteCategory = deleteOne(Category);

export {
  addCategory,
  getAllCategories,
  getSpecificCategory,
  updateCategory,
  deleteCategory,
};
