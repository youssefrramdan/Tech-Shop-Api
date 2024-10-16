import { Router } from "express";
import {
  addUser,
  getAllUsers,
  getSpecificUser,
  deleteUser,
  updateUser,
} from "./user.controller.js";
import { protectedRoutes } from "../../auth/auth.controller.js";
import { checkEmail } from "../../middlewares/checkEmail.js";
const userRouter = Router();
userRouter.route("/").post(checkEmail,addUser).get(getAllUsers);
userRouter
  .route("/:id")
  .get(protectedRoutes,getSpecificUser)
  .put( protectedRoutes,updateUser)
  .delete(protectedRoutes,deleteUser);

export default userRouter;
