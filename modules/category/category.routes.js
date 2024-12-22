import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getSpecificCategory,
  updateCategory,
} from "./category.controller.js";
import { uploadSingleImage } from "../../middlewares/uploadImages.js";

const categoryRouter = Router();

// Routes for categories
categoryRouter
  .route("/")
  .post(uploadSingleImage("imageCover"), addCategory) // Add category with image upload
  .get(getAllCategories); // Get all categories

categoryRouter
  .route("/:id")
  .get(getSpecificCategory) // Get specific category by ID
  .put(uploadSingleImage("imageCover"), updateCategory) // Update category with image upload
  .delete(deleteCategory); // Delete category

export default categoryRouter;
