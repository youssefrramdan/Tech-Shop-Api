// authController.js

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../utils/appError.js";
import { User } from "../models/User.model.js";
import { catchError } from "../middlewares/catchError.js";

// JWT Secret من متغير البيئة
const JWT_SECRET = process.env.JWT_SECRET || "1234";

// دالة مساعدة لتوليد JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// دالة مساعدة لتنسيق بيانات المستخدم
const formatUser = (user) => {
  return {
    name: user.name,
    email: user.email,
    role: user.role
  };
};

// دالة تسجيل المستخدم (Signup)
const Signup = catchError(async (req, res) => {
  const { password, rePassword, ...userData } = req.body;

  // التحقق من تطابق كلمات المرور
  if (password !== rePassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // التحقق من عدم وجود المستخدم مسبقًا
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // تشفير كلمة المرور قبل الحفظ
  const hashedPassword = await bcrypt.hash(password, 12);

  // إنشاء المستخدم
  let user = new User({ ...userData, password: hashedPassword });
  await user.save();

  // توليد التوكن
  let token = generateToken(user);

  // حفظ التوكن في الكوكيز
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // تأكد من تفعيل العلم secure في الإنتاج
    maxAge: 3600000, // 1 ساعة بالميلي ثانية
    sameSite: 'Strict',
  });

  res.status(201).json({ 
    message: "Registration successful", 
    user: formatUser(user), 
    token, 
    expiresIn: '1h' 
  });
});

// دالة تسجيل الدخول (Signin)
const Signin = catchError(async (req, res) => {
  const { email, password } = req.body;

  // البحث عن المستخدم بواسطة البريد الإلكتروني
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // مقارنة كلمات المرور
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // توليد التوكن
  let token = generateToken(user);

  // حفظ التوكن في الكوكيز
  res.cookie('token', token, {
    httpOnly: true, // يمكن الوصول إليه فقط من قبل الخادم
    secure: process.env.NODE_ENV === 'production', // تأكد من تفعيل العلم secure في الإنتاج
    maxAge: 3600000, // 1 ساعة بالميلي ثانية
    sameSite: 'Strict', // منع CSRF
  });

  // إرسال التوكن في جسم الاستجابة ليتم تخزينه في الـ Local Storage
  res.status(200).json({ 
    message: "Success login", 
    user: formatUser(user), 
    token, 
    expiresIn: '1h' 
  });
});

// دالة تغيير كلمة المرور (changeUserPassword)
const changeUserPassword = catchError(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  // البحث عن المستخدم بواسطة البريد الإلكتروني
  let user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // مقارنة كلمة المرور القديمة
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // تشفير كلمة المرور الجديدة
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedNewPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  // توليد توكن جديد
  let token = generateToken(user);

  // حفظ التوكن الجديد في الكوكيز
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // تأكد من تفعيل العلم secure في الإنتاج
    maxAge: 3600000, // 1 ساعة بالميلي ثانية
    sameSite: "Strict",
  });

  // إرسال التوكن الجديد في جسم الاستجابة ليتم تخزينه في الـ Local Storage
  res.status(200).json({
    message: "Password changed successfully",
    user: formatUser(user),
    token,
    expiresIn: "1h",
  });
});

// Middleware حماية المسارات (protectedRoutes)
const protectedRoutes = catchError(async (req, res, next) => {
  const { authorization } = req.headers;
  let token = null;

  // استخراج التوكن من رأس Authorization مباشرة بدون 'Bearer '
  if (authorization) {
    token = authorization; // التوكن يُرسل مباشرة بدون 'Bearer '
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
    const passwordChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    if (passwordChangedTimestamp > userPayload.iat) {
      return next(new AppError("Password changed recently, please login again", 401));
    }
  }

  req.user = user;
  next();
});

// Middleware تفويض الوصول بناءً على الأدوار (alloweTo)
const alloweTo = (...roles) => {
  return catchError(async (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return next(
      new AppError("You are not authorized to access this endpoint", 403)
    ); // تعيين رمز الحالة HTTP إلى 403 (Forbidden)
  });
};

export { Signup, Signin, changeUserPassword, protectedRoutes, alloweTo };
