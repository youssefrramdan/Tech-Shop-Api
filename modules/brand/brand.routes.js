import { Router } from "express";
import {
  addBrand,
  getAllBrands,
  getSpecificBrand,
  deleteBrand,
  updateBrand,
} from "../brand/brand.controller.js";
import { protectedRoutes } from "../../auth/auth.controller.js"; 
import { uploadSingleImage } from "../../middlewares/uploadImages.js";

const brandRouter = Router();

// مسارات العلامات التجارية
brandRouter
  .route("/") // المسار الجذري
  .get(getAllBrands) // جلب جميع العلامات التجارية
  .post(protectedRoutes, uploadSingleImage('logo'), addBrand); // إضافة علامة تجاري

brandRouter
  .route("/:id") // المسار الخاص بعلامة تجارية معينة
  .get(getSpecificBrand) // جلب علامة تجارية محددة
  .put(protectedRoutes, uploadSingleImage('logo'), updateBrand) // تحديث علامة تجارية
  .delete(protectedRoutes, deleteBrand); // حذف علامة تجارية

export default brandRouter;
