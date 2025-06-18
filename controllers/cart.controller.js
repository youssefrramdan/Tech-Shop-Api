import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';

const calcTotalCartPrice = cart => {
  let totalPrice = 0;
  cart.cartItems.forEach(item => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
    
