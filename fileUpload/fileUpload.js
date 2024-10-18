import cloudinary from "cloudinary";

// تأكد من تكوين Cloudinary هنا إذا لم تكن قد فعلت ذلك
cloudinary.v2.config({
  cloud_name: "dthsq3uel",
  api_key: "328725283681524",
  api_secret: "KmnJYIzD1G68dFGLySZPOhS6No4",
});

// رفع الصورة إلى Cloudinary
export const cloudinaryUploadImage = async (fileBuffer) => {
  try {
    // استخدام upload_stream لرفع الصورة من Buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // تمرير الـ Buffer إلى الـ stream
      stream.end(fileBuffer);
    });

    return result; // إرجاع نتيجة رفع الصورة
  } catch (error) {
    throw error; // إعادة رمي الخطأ في حال وجود مشكلة
  }
};
