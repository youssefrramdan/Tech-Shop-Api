import { AppError } from "../utils/appError.js";

export const validate = (schema) => {
  return async (req, res, next) => {
    
    let { error } = schema.validate(
      { image: req.file, ...req.body, ...req.body, ...req.query },
      { abortEarly: false }
    );
    if (!error) {
      next();
    } else {
      let errMsgs = error.details.map((err) => err.message);
      next(new AppError(errMsgs, 401));
    }
  };
};
