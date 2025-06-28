import ApiError from '../utils/apiError.js';
import asyncHandler from 'express-async-handler';

const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ApiError('Not authorized as an admin', 403));
  }
  next();
});

export default adminOnly;
