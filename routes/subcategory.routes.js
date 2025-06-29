import express from 'express';
import { protectedRoutes } from '../controllers/auth.controller.js';
import {
  createFilterObj,
  createSubCategory,
  deleteSpecificSubCategory,
  getAllSubCategories,
  getSpecificSubCategory,
  setCategoryIdToBody,
  updateSpecificSubCategory,
} from '../controllers/subcategory.controller.js';


const subCategoryRouter = express.Router({ mergeParams: true });

// mergeParams: Allow us to access parameters on other routers
// ex: We need to access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protectedRoutes, setCategoryIdToBody, createSubCategory)
  .get(createFilterObj, getAllSubCategories);
router
  .route('/:id')
  .get(getSpecificSubCategory)
  .put(protectedRoutes, updateSpecificSubCategory)
  .delete(protectedRoutes, deleteSpecificSubCategory);

export default subCategoryRouter;
