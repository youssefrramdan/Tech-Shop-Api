import express from 'express';
import {
  createRentalRequest,
  getUserRentalRequests,
  getAllRentalRequests,
  getRentalRequest,
  updateRentalRequestStatus,
  updateReturnCondition,
  getRentalStats,
} from '../controllers/rentalRequest.controller.js';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';
import createUploader from '../middlewares/cloudnairyMiddleware.js';

const upload = createUploader('rental-documents');
const rentalRequestRouter = express.Router();

// All routes require authentication
rentalRequestRouter.use(protectedRoutes);

// User routes
rentalRequestRouter.post(
  '/',
  upload.fields([
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 },
  ]),
  createRentalRequest
);

rentalRequestRouter.get('/my-requests', getUserRentalRequests);

// Admin routes
rentalRequestRouter.get('/stats', allowTo('admin'), getRentalStats);
rentalRequestRouter.get('/', allowTo('admin'), getAllRentalRequests);

// Single request routes
rentalRequestRouter.get('/:id', getRentalRequest);

// Admin only routes for managing requests
rentalRequestRouter.patch(
  '/:id/status',
  allowTo('admin'),
  updateRentalRequestStatus
);

rentalRequestRouter.patch(
  '/:id/return',
  allowTo('admin'),
  updateReturnCondition
);

export default rentalRequestRouter;


