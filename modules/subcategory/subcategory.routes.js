import { Router } from "express";
import {
  addSubCategory,
  getAllSubCategories, 
  getSpecificSubCategory,
  updateSubCategory,
  deleteSubCategory
} from "./subcategory.controller.js";
import { checkCategoryExists } from "../../middlewares/checkCategoryExists.js";
import { protectedRoutes } from "../../auth/auth.controller.js";

const subCategoryRouter = Router({mergeParams:true });
subCategoryRouter
.route("/")
.post(protectedRoutes,checkCategoryExists,addSubCategory)
.get(getAllSubCategories);
subCategoryRouter
  .route("/:id")
  .get(getSpecificSubCategory)
  .put(protectedRoutes,checkCategoryExists,updateSubCategory)
  .delete(protectedRoutes,checkCategoryExists,deleteSubCategory);

export default subCategoryRouter;
