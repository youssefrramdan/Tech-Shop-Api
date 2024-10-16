import Joi from "joi";
import { Types } from "mongoose";

const subCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  slug: Joi.string().lowercase().required(),
  category: Joi.string().custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.message("Invalid category ID");
    }
    return value;
  }).required(), 
});

export { subCategoryValidation };
