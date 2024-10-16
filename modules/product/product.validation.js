import Joi from "joi";

const productValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  slug: Joi.string().lowercase(),
  description: Joi.string().min(30).max(20000).required(),
  imageCover: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid("image/jpeg", "image/png", "image/gif").required(),
    size: Joi.number().max(5242880).required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
  }).required(),
  images: Joi.array().items(
    Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().valid("image/jpeg", "image/png", "image/gif","image/jpeg").required(),
      size: Joi.number().max(5242880).required(),
      destination: Joi.string().required(),
      filename: Joi.string().required(),
      path: Joi.string().required(),
    })
  ),
  price: Joi.number().min(0).required(),
  priceAfterDiscount: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  discount: Joi.number().min(0).max(100),
  category: Joi.string().required(),
  subcategory: Joi.string().required(),
  brand: Joi.string().required(),
});

export { productValidation };
