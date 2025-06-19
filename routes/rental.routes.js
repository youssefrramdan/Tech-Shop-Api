import express from 'express';
import {
  createRental,
  getRentals,
  getMyRentals,
  getRental,
  updateRentalStatus,
  updatePaymentStatus,
} from '../controllers/rental.controller.js';
import { protectedRoutes, allowTo } from '../controllers/auth.controller.js';

const router = express.Router();

// Protect all routes
router.use(protectedRoutes);

// User routes
router.post('/', allowTo('user'), createRental);
router.get('/my-rentals', allowTo('user'), getMyRentals);
router.get('/:id', allowTo('user', 'admin'), getRental);

// Admin routes
router.get('/', allowTo('admin'), getRentals);
router.patch('/:id/status', allowTo('admin'), updateRentalStatus);
router.patch('/:id/payment', allowTo('admin'), updatePaymentStatus);

export default router;
