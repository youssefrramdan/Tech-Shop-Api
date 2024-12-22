import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../utils/appError.js";
import { User } from "../models/User.model.js";
import { catchError } from "../middlewares/catchError.js";

// JWT Secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "1234";

const Signup = catchError(async (req, res, next) => {
  const { password, rePassword, ...userData } = req.body;

  // Validate passwords match
  if (password !== rePassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create the user
  let user = new User({
    ...userData,
    password: hashedPassword,
  });
  await user.save();

  // Generate JWT token
  const expiresIn = "1h";
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn,
  });

  // Set the token in a secure cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 3600000, // 1 hour in milliseconds
    sameSite: "Strict",
  });

  // Return response
  res.status(201).json({
    message: "Registration successful",
    user,
    token,
    expiresIn,
  });
});

const Signin = catchError(async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  let token = jwt.sign(
    { userId: user._id, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" } // Token expiration time
  );

  // Save the token in a cookie
  res.cookie("token", token, {
    httpOnly: true, // Accessible only by the web server
    secure: true, // Always secure (only sent over HTTPS)
    maxAge: 3600000, // Token valid for 1 hour (in milliseconds)
    sameSite: "Strict", // Prevent CSRF
  });

  res
    .status(200)
    .json({ message: "Success login", user, token, expiresIn: "1h" });
});

const changeUserPassword = catchError(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });

  if (user && bcrypt.compareSync(req.body.oldPassword, user.password)) {
    user.password = req.body.newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    let token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expiration time
    );

    // Save the new token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000, // Expire in 1 hour (in milliseconds)
      sameSite: "Strict",
    });

    return res
      .status(200)
      .json({
        message: "Password changed successfully",
        user,
        token,
        expiresIn: "1h",
      });
  }

  return next(new AppError("Incorrect email or password", 401));
});

const protectedRoutes = catchError(async (req, res, next) => {
  let { authorization } = req.headers;
  let userPayload = null;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError("Token not provided or invalid format", 401));
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err && err.name === "TokenExpiredError") {
      return next(new AppError("Token expired, please login again", 401));
    }
    if (err) return next(new AppError("Invalid token", 401));
    userPayload = payload;
  });

  let user = await User.findById(userPayload.userId);
  if (!user) return next(new AppError("User not found", 401));

  if (user.passwordChangedAt) {
    let time = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (time > userPayload.iat) {
      return next(new AppError("Invalid token, login again", 401));
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
    return next(
      new AppError("You are not authorized to access this endpoint", 403)
    ); // Set HTTP status code to 403 (Forbidden)
  });
};

export { Signup, Signin, changeUserPassword, protectedRoutes, alloweTo };
