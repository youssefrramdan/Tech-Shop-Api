import { catchError } from "../../middlewares/catchError.js";
import { Brand } from "../../models/Brand.model.js";
import slugify from "slugify";
import { AppError } from "../../utils/appError.js";
import { cloudinaryUploadImage } from "../../fileUpload/fileUpload.js";
import { uploadSingleImage } from "../../middlewares/uploadImages.js";


const addBrand = catchError(async (req, res, next) => {
  // تحقق مما إذا كان الملف موجودًا
  if (!req.file) {
    return next(new AppError("Logo is required", 400)); // قم بإرجاع خطأ إذا لم يتم رفع اللوغو
  }

  // رفع الشعار إلى Cloudinary
  const result = await cloudinaryUploadImage(req.file.buffer); // استخدم buffer
console.log(result);

  req.body.slug = slugify(req.body.name, { lower: true });
  req.body.logo = result.secure_url; // استخدم الرابط الذي تم إرجاعه من Cloudinary

  const brand = new Brand(req.body);
  await brand.save();

  res.status(201).json({ message: "success", brand });
});

const getAllBrands = catchError(async (req, res, next) => {
  const brands = await Brand.find();
  res.json({ message: "success", brands });
});

const getSpecificBrand = catchError(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }
  res.json({ message: "success", brand });
});

const updateBrand = catchError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name, { lower: true });

  if (req.file) {
    const result = await cloudinaryUploadImage(req.file.buffer);
    req.body.logo = result.secure_url;
  }

  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  res.json({ message: "success", brand });
});

// حذف علامة تجارية
const deleteBrand = catchError(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  res.json({ message: "Brand deleted successfully", brand });
});

// تصدير الدوال
export { addBrand, getAllBrands, getSpecificBrand, updateBrand, deleteBrand };
