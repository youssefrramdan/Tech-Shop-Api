/* eslint-disable arrow-body-style */
/* eslint-disable import/no-extraneous-dependencies */

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createUploader = folder => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folder || 'products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        return `${file.fieldname}-${uniqueSuffix}`;
      },
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Not an image! Please upload only images.'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
  });
};

export default createUploader;
