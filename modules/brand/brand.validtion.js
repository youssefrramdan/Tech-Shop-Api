import Joi from "joi";

const brandValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  slug: Joi.string().lowercase().required(),
  logo: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid("image/jpeg", "image/png", "image/gif").required(),
    size: Joi.number().max(5242880).required(), // Max file size of 5MB
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
  }).optional(), // logo is optional
});

export { brandValidation };
