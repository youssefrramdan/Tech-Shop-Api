import { catchError } from "../../middlewares/catchError.js";
import { AppError } from "../../utils/appError.js";

export const deleteOne = (model) => {
  return catchError(async (req, res, next) => {
    let document = await model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError("Document not found", 404));
    }

    res.json({ message: "success", document });
  });
};
export const updateOne = (model) => {
  return catchError(async (req, res, next) => {
    console.log(req.body);
    let document = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(new AppError("Document not found", 404));
    }

    res.json({ message: "success", document });
  });
};
