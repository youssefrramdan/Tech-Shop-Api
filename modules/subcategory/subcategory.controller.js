import { catchError } from "../../middlewares/catchError.js";
import { SubCategory } from "./../../models/SubCategory.model.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";
import { deleteOne, updateOne } from "../handlers/handlers.js";

const addSubCategory = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });
  let subCategory = new SubCategory(req.body);
  await subCategory.save();
  res.json({ message: "success", subCategory });
});

const getAllSubCategories = catchError(async (req, res, next) => {
  let filterObj ={}
  if (req.params.category) {
    filterObj = req.params.category
  }
  let subcategories = await SubCategory.find(filterObj);
  res.json({ message: "success", subcategories });
});

const getSpecificSubCategory = catchError(async (req, res, next) => {
  let subCategory = await SubCategory.findById(req.params.id).populate(
    "category",
    { name: 1, _id: 0 }
  );
  if (!subCategory) {
    return next(new AppError("SubCategory not found", 404));
  }
  res.json({ message: "success", subCategory });
});

const updateSubCategory = updateOne(SubCategory);

const deleteSubCategory = deleteOne(SubCategory)

export {
  addSubCategory,
  getAllSubCategories,
  getSpecificSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
