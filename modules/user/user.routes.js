import { Router } from "express";
import {
  addUser,
  getAllUsers,
  getSpecificUser,
  deleteUser,
  updateUser,
} from "./user.controller.js";
import { protectedRoutes } from "../../auth/auth.controller.js";

const userRouter = Router();
userRouter.route("/").post(addUser).get(getAllUsers);
userRouter
  .route("/:id")
  .get(protectedRoutes,getSpecificUser)
  .put( protectedRoutes,updateUser)
  .delete(protectedRoutes,deleteUser);

export default userRouter;
