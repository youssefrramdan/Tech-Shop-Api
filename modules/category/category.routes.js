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
import { protectedRoutes } from "../../auth/auth.controller.js";
import { uploadSingleImage } from "../../middlewares/uploadImages.js"; // Middleware for single image upload

const categoryRouter = Router();

// Routes for categories
categoryRouter
  .route("/")
  .post(
    protectedRoutes, // Authenticated route
    uploadSingleImage("image"), // Support for uploading a single image (field name: image)
    validate(addcategoryValidation), // Input validation
    addCategory // Controller logic for adding a category
  )
  .get(getAllCategories); // Fetch all categories

categoryRouter
  .route("/:id")
  .get(getSpecificCategory) // Fetch a specific category by ID
  .put(
    protectedRoutes, // Authenticated route
    uploadSingleImage("image"), // Support for updating the image
    updateCategory // Controller logic for updating the category
  )
  .delete(protectedRoutes, deleteCategory); // Protected route for deleting a category

export default categoryRouter;
