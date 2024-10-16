import { Router } from "express";
import {
  addProduct,
  getAllProducts,
  getSpecificProduct,
  deleteProduct,
  updateProduct,
  pagination,
} from "./product.controler.js";
import { uploadMixOfFiles } from "../../fileUpload/fileUpload.js";
import { checkCategoryExists } from "../../middlewares/checkCategoryExists.js";
import { checkSubcategoryExists } from "../../middlewares/checkSubCategoryExists.js";
import { checkBrandExists } from "../../middlewares/checkBrandExists.js";
import { protectedRoutes } from "../../auth/auth.controller.js";

const productRouter = Router();
productRouter
  .route("/")
  .post(protectedRoutes,
    checkCategoryExists,
    checkSubcategoryExists,
    checkBrandExists,
    addProduct
  )
  .get(getAllProducts)
  productRouter.get("/v1",pagination);
productRouter
  .route("/:id")
  .get(getSpecificProduct)
  .put(protectedRoutes,
    updateProduct
  )
  .delete(protectedRoutes,deleteProduct);
// pagination
export default productRouter;
