import cloudinary from 'cloudinary'; // Import the entire module
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/appError.js';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: "dthsq3uel",
  api_key: "328725283681524",
  api_secret: "KmnJYIzD1G68dFGLySZPOhS6No4",
});

// Create a file upload function
export const FileUpload = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2, // Use cloudinary.v2 directly
    params: {
      folder: folderName, // Folder in your Cloudinary account
      format: async (req, file) => {
        return 'png'; // Optional: specify format
      },
      public_id: (req, file) => {
        return `${uuidv4()}-${file.originalname}`; // Unique filename
      },
    },
  });

  // File filter to allow only images
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only images are allowed', 400), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
  });

  return upload;
};

// Middleware to upload a single file
export const uploadSingleFile = (fieldName, folderName) => 
  FileUpload(folderName).single(fieldName);

// Middleware to upload multiple files
export const uploadMixOfFiles = (arrayOfFields, folderName) => {
  return FileUpload(folderName).fields(arrayOfFields);
};
