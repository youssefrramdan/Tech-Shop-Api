import { SubCategory } from "../models/SubCategory.model.js";
import { AppError } from "../utils/appError.js";

export const checkSubcategoryExists = async (req, res, next) => {
  try {
    let subcategoryId = req.body.subcategory;

    if (!subcategoryId) {
      return next(new AppError("subcategoryId is required", 400));
    }

    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      return next(new AppError("Subcategory not found", 404));
    }

    next();
  } catch (error) {
    next(error);
  }
};
