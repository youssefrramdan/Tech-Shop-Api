import asyncHandler from 'express-async-handler';
import ApiError from '../apiError.js';

export const deleteOne = model =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new ApiError('Document not found', 404));
    }

    res.json({ message: 'success', document });
  });
export const updateOne = model =>
  asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(new ApiError('Document not found', 404));
    }

    res.json({ message: 'success', document });
  });
