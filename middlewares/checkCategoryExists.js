import { Category } from "../models/Category.model.js";
import { AppError } from "../utils/appError.js";

export const checkCategoryExists = async (req, res, next) => {
  try {

    if (!req.body.category) {
      return next(new AppError("Category ID is required", 400));
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    next();
  } catch (error) {
    next(error);
  }
};
