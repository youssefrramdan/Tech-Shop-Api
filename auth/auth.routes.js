import { Router } from "express";
import { changeUserPassword, Signin, Signup } from "../auth/auth.controller.js";
import { checkEmail } from "../middlewares/checkEmail.js";
import { Passport } from "passport";

const authRouter = Router();
authRouter.post("/signup", checkEmail,Signup);
authRouter.post("/signin", Signin);
authRouter.patch("/changepassword", changeUserPassword);
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
  "/auth/google/callback",
  Passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

export default authRouter;
