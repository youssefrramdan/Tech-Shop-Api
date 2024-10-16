import { Router } from "express";
import {
  addBrand,
  getAllBrands,
  getSpecificBrand,
  deleteBrand,
  updateBrand,
} from "../brand/brand.controller.js";
import { uploadSingleFile } from "../../fileUpload/fileUpload.js";
import { protectedRoutes } from "../../auth/auth.controller.js";

const brandRouter = Router();
brandRouter
  .route("/")
  .get(getAllBrands)
  .post(protectedRoutes,uploadSingleFile("logo", "brands"), addBrand)
brandRouter
  .route("/:id")
  .get(getSpecificBrand)
  .put(protectedRoutes,uploadSingleFile("logo", "brands"), updateBrand)
  .delete(protectedRoutes,uploadSingleFile("logo", "brands"), deleteBrand);

export default brandRouter;
