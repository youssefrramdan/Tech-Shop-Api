// authController.js

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../utils/appError.js";
import { User } from "../models/User.model.js";
import { catchError } from "../middlewares/catchError.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: null, 
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

const JWT_SECRET = process.env.JWT_SECRET || "1234";

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const formatUser = (user) => {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const Signup = catchError(async (req, res) => {
  const { password, rePassword, ...userData } = req.body;

  if (password !== rePassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let user = new User({ ...userData, password: hashedPassword });
  await user.save();

  let token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000,
    sameSite: "Strict",
  });

  res.status(201).json({
    message: "Registration successful",
    user: formatUser(user),
    token,
    expiresIn: "1h",
  });
});

const Signin = catchError(async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  let token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000,
    sameSite: "Strict",
  });

  res.status(200).json({
    message: "Success login",
    user: formatUser(user),
    token,
    expiresIn: "1h",
  });
});

const changeUserPassword = catchError(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedNewPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  let token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000,
    sameSite: "Strict",
  });

  res.status(200).json({
    message: "Password changed successfully",
    user: formatUser(user),
    token,
    expiresIn: "1h",
  });
});

const protectedRoutes = catchError(async (req, res, next) => {
  const { authorization } = req.headers;
  let token = null;

  if (authorization) {
    token = authorization;
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("Token not provided", 401));
  }

  let userPayload;
  try {
    userPayload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired, please login again", 401));
    }
    return next(new AppError("Invalid token", 401));
  }

  const user = await User.findById(userPayload.userId);
  if (!user) {
    return next(new AppError("User not found", 401));
  }

  if (user.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimestamp > userPayload.iat) {
      return next(
        new AppError("Password changed recently, please login again", 401)
      );
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
    );
  });
};

export { Signup, Signin, changeUserPassword, protectedRoutes, alloweTo };
