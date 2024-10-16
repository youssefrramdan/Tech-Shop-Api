import { Brand } from "../models/Brand.model.js";
import { AppError } from "../utils/appError.js";

export const checkBrandExists = async (req, res, next) => {
  try {
    let brandId = req.body.brand;

    if (!brandId) {
      return next(new AppError("brandId is required", 400));
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return next(new AppError("Brand not found", 404));
    }

    next();
  } catch (error) {
    next(error);
  }
};
