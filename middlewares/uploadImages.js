import multer from 'multer';
import { AppError } from '../utils/appError.js';

// إعدادات multer
const multerOptions = () => {
  // تخزين الملفات في الذاكرة (Buffer)
  const multerStorage = multer.memoryStorage();

  // فلتر للتحقق من نوع الملفات
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // إذا كان الملف صورة، قم بتمريرها
    } else {
      cb(new AppError('Only images are allowed', 400), false); // إذا لم يكن صورة، قم بإرجاع خطأ
    }
  };

  // إنشاء multer مع إعدادات التخزين والفلتر
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload; // إرجاع المثيل المُهيأ
};

// Middleware لرفع صورة واحدة
export const uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

// Middleware لرفع عدة ملفات
export const uploadMixedImage = (arrayOfFields) => multerOptions().fields(arrayOfFields);
