import { Router } from "express";
import {
  addBrand,
  getAllBrands,
  getSpecificBrand,
  deleteBrand,
  updateBrand,
} from "../brand/brand.controller.js";
import { protectedRoutes } from "../../auth/auth.controller.js";

const brandRouter = Router();
brandRouter
  .route("/")
  .get(getAllBrands)
  .post(protectedRoutes, addBrand)
brandRouter
  .route("/:id")
  .get(getSpecificBrand)
  .put(protectedRoutes, updateBrand)
  .delete(protectedRoutes, deleteBrand);

export default brandRouter;
