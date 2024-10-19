import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../utils/appError.js";
import { User } from "../models/User.model.js";
import { catchError } from "../middlewares/catchError.js";

const Signup = catchError(async (req, res) => {
  let user = await new User(req.body);
  await user.save();
  let token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    "1234"
  );
  res.setHeader("Authorization", `Bearer ${token}`);
  res.status(201).json({ message: "success", user, token });
});

const Signin = catchError(async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  let token = jwt.sign(
    { userId: user._id, name: user.name, role: user.role },
    "1234"
  );
  res.setHeader("Authorization", `Bearer ${token}`);
  res.status(200).json({ message: "Success login", user ,token });
});

const changeUserPassword = catchError(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });

  if (user && bcrypt.compareSync(req.body.oldPassword, user.password)) {
    user.password = req.body.newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    let token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      "1234"
    );
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(200).json({ message: "Password changed successfully",user ,token });
  }

  return next(new AppError("Incorrect email or password", 401));
});


const protectedRoutes = catchError(async (req, res, next) => {
  let { authorization } = req.headers;
  let userPayload = null;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError("token not provided or invalid format", 401));
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, "1234", (err, payload) => {
    if (err) return next(new AppError(err, 401));
    userPayload = payload;
  });

  let user = await User.findById(userPayload.userId);
  if (!user) return next(new AppError("user not found", 401));

  if (user.passwordChangedAt) {
    let time = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (time > userPayload.iat) {
      return next(new AppError("invalid token ... login again", 401));
    }
  }

  req.user = user; 
  next();
});

const alloweTo = (...roles) => {
  return catchError(async (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return next(new AppError('You are not authorized to access this endpoint', 403)); // Optionally, you can set the HTTP status code to 403 (Forbidden)
  });
};

export { Signup, Signin, changeUserPassword, protectedRoutes, alloweTo };
