import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getSpecificCategory,
  updateCategory,
} from "./category.controller.js";
import { uploadSingleFile } from "../../fileUpload/fileUpload.js";
import { addcategoryValidation } from "./category.validation.js";
import { validate } from "../../middlewares/validate.js";
import subCategoryRouter from "../subcategory/subcategory.routes.js";
import { protectedRoutes } from "../../auth/auth.controller.js";

const categoryRouter = Router();
categoryRouter.use("/:category/subcategories", subCategoryRouter);
categoryRouter
  .route("/")
  .post(
    protectedRoutes,
    uploadSingleFile("image", "categories"),
    validate(addcategoryValidation),
    addCategory
  )

  .get(getAllCategories);
categoryRouter
  .route("/:id")
  .get(getSpecificCategory)
  .put(protectedRoutes, uploadSingleFile("image", "categories"), updateCategory)
  .delete(protectedRoutes, deleteCategory);

export default categoryRouter;
