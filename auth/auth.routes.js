import { Router } from "express";
import { changeUserPassword, Signin, Signup } from "../auth/auth.controller.js";
import { checkEmail } from "../middlewares/checkEmail.js";

const authRouter = Router();
authRouter.post("/signup", checkEmail,Signup);
authRouter.post("/signin", Signin);
authRouter.patch("/changepassword", changeUserPassword);
authRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

export default authRouter;
