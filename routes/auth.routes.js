import express from 'express';
import {
  signup,
  login,
  confirmEmail,
  resendEmail,
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

// Email verification routes
router.get('/verify/:token', confirmEmail);
router.post('/resend-email', resendEmail);

// Password management routes
router.post('/forgot-password', forgetPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protectedRoutes); // Apply protection middleware to all routes below
router.post('/logout', logout);

export default router;
