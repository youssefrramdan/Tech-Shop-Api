import { check } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware.js';

export const addToCartValidator = [
  check('productId').isMongoId().withMessage('Invalid product ID format'),
  check('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  validatorMiddleware,
];

export const updateCartItemValidator = [
  check('id').isMongoId().withMessage('Invalid cart item ID format'),
  check('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  validatorMiddleware,
];

export const removeCartItemValidator = [
  check('id').isMongoId().withMessage('Invalid cart item ID format'),
  validatorMiddleware,
];

export const applyCouponValidator = [
  check('coupon')
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Coupon code must be between 2 and 50 characters'),
  validatorMiddleware,
];
