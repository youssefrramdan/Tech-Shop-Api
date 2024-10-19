import { Router } from "express";
import {
  addProduct,
  getAllProducts,
  getSpecificProduct,
  deleteProduct,
  updateProduct,
  pagination,
} from "./product.controler.js";
import { checkCategoryExists } from "../../middlewares/checkCategoryExists.js";
import { checkSubcategoryExists } from "../../middlewares/checkSubCategoryExists.js";
import { checkBrandExists } from "../../middlewares/checkBrandExists.js";
import { protectedRoutes } from "../../auth/auth.controller.js";
import { uploadMixedImage } from "../../middlewares/uploadImages.js"; // استيراد uploadMixedImage

const productRouter = Router();

// Routes for products
productRouter
  .route("/")
  .post(
    protectedRoutes,
    uploadMixedImage([{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 10 }]), // إضافة دعم لرفع الصور
    checkCategoryExists,
    checkSubcategoryExists,
    checkBrandExists,
    addProduct
  )
  .get(getAllProducts);

// Pagination route
productRouter.get("/v1", pagination);

productRouter
  .route("/:id")
  .get(getSpecificProduct)
  .put(
    protectedRoutes,
    uploadMixedImage([{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 10 }]), // إضافة دعم لرفع الصور عند التحديث
    updateProduct
  )
  .delete(protectedRoutes, deleteProduct);

// Export the router
export default productRouter;
