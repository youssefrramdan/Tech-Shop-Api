import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getSpecificCategory,
  updateCategory,
} from "./category.controller.js";
import { addcategoryValidation } from "./category.validation.js";
import { validate } from "../../middlewares/validate.js";
import subCategoryRouter from "../subcategory/subcategory.routes.js";
import { protectedRoutes } from "../../auth/auth.controller.js";
import { uploadSingleImage } from "../../middlewares/uploadImages.js";

const categoryRouter = Router();
categoryRouter.use("/:category/subcategories", subCategoryRouter);
categoryRouter
  .route("/")
  .post(
    protectedRoutes,
    uploadSingleImage("image", "categories"),
    validate(addcategoryValidation),
    addCategory
  )

  .get(getAllCategories);
categoryRouter
  .route("/:id")
  .get(getSpecificCategory)
  .put(protectedRoutes, updateCategory)
  .delete(protectedRoutes, deleteCategory);

export default categoryRouter;
