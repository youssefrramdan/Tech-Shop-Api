import { catchError } from "../../middlewares/catchError.js";
import { Category } from "../../models/Category.model.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";
import { deleteOne, updateOne } from "../handlers/handlers.js";

const addCategory = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });
  // req.body.image = req.file.filename;
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

const updateCategory = updateOne(Category)

const deleteCategory = deleteOne(Category)


export {
  addCategory,
  getAllCategories,
  getSpecificCategory,
  updateCategory,
  deleteCategory,
};
