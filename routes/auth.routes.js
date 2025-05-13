import express from 'express';
import {
  signup,
  login,
  protectedRoutes,
  allowTo,
  forgetPassword,
  verifyResetCode,
  resetPassword,
  logout,
} from '../controllers/auth.controller.js';

const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);

// Password management routes
router.post('/forgot-password', forgetPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protectedRoutes); // Apply protection middleware to all routes below
router.post('/logout', logout);

export default router;
