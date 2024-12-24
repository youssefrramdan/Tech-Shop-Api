import { catchError } from "../middlewares/catchError.js";
import { Cart } from "../models/Cart.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { AppError } from "../utils/appError.js";

// Create Cash Order
const createCashOrder = catchError(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  let totalOrderPrice = cart.totalCartPriceAfterDiscount || cart.totalCartPrice;

  let order = new Order({
    user: req.user._id,
    OrderItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  await order.save();

  let options = cart.cartItems.map((prod) => ({
    updateOne: {
      filter: { _id: prod.product },
      update: { $inc: { sold: prod.quantity, stock: -prod.quantity } },
    },
  }));

  try {
    await Product.bulkWrite(options);
    await Cart.findByIdAndDelete(cart._id);
  } catch (error) {
    return next(new AppError("Failed to update product stock", 500));
  }

  res.status(201).json({ message: "Order created successfully", order });
});

// Get User Orders
const getUserOrders = catchError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).populate({
    path: "OrderItems.product",
    select: "name image price description category",
  });

  if (!orders || orders.length === 0) {
    return res.status(404).json({ message: "No orders found for this user" });
  }

  res.status(200).json({ message: "success", orders });
});


const getAllOrders = catchError(async (req, res, next) => {
  const orders = await Order.find({});

  if (!orders || orders.length === 0) {
    return res.status(404).json({ message: "No orders found" });
  }

  res.status(200).json({ message: "success", orders });
});

export { createCashOrder, getUserOrders, getAllOrders };
