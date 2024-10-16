import { Router } from "express";
import { changeUserPassword, Signin, Signup } from "../auth/auth.controller.js";

const authRouter = Router();
authRouter.post("/signup", checkEmail,Signup);
authRouter.post("/signin", Signin);
authRouter.patch("/changepassword", changeUserPassword);

export default authRouter;
