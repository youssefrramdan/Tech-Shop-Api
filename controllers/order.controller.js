import { catchError } from '../middlewares/catchError.js';
import { Cart } from '../models/Cart.model.js';
import { Order } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { AppError } from '../utils/appError.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Cash Order
const createCashOrder = catchError(async (req, res, next) => {
  const { cartId } = req.params;

  let cart = await Cart.findById(cartId).populate('cartItems.product');
  if (!cart) return next(new AppError('Cart not found', 404));

  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to access this cart', 403));
  }

  let totalOrderPrice = cart.totalCartPriceAfterDiscount || cart.totalCartPrice;

  let order = new Order({
    user: req.user._id,
    OrderItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentType: 'cash',
    isPaid: false,
  });

  await order.save();

  // Update product stock and sold count
  let options = cart.cartItems.map(item => ({
    updateOne: {
      filter: { _id: item.product._id },
      update: { $inc: { sold: item.quantity, stock: -item.quantity } },
    },
  }));

  try {
    await Product.bulkWrite(options);
    await Cart.findByIdAndDelete(cart._id);
  } catch (error) {
    console.error('Error updating product stock:', error);
    return next(new AppError('Failed to update product stock', 500));
  }

  res.status(201).json({
    message: 'Order created successfully',
    order: {
      id: order._id,
      totalOrderPrice: order.totalOrderPrice,
      paymentType: order.paymentType,
      isPaid: order.isPaid,
      createdAt: order.createdAt,
    },
  });
});

// Create Online Payment Session
const createOnlinePayment = catchError(async (req, res, next) => {
  const { cartId } = req.params;

  let cart = await Cart.findById(cartId).populate('cartItems.product');
  if (!cart) return next(new AppError('Cart not found', 404));

  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to access this cart', 403));
  }

  let totalOrderPrice = cart.totalCartPriceAfterDiscount || cart.totalCartPrice;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: cart.cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name || item.product.title,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/orders?success=true`,
    cancel_url: `${process.env.CLIENT_URL}/cart?canceled=true`,
    metadata: {
      cartId: cartId,
      userId: req.user._id.toString(),
      shippingAddress: JSON.stringify(req.body.shippingAddress),
    },
  });

  res.status(200).json({
    message: 'Payment session created successfully',
    session: {
      id: session.id,
      url: session.url,
    },
  });
});

// Webhook to handle successful payment
const handleStripeWebhook = catchError(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { cartId, userId, shippingAddress } = session.metadata;

    const cart = await Cart.findById(cartId).populate('cartItems.product');
    if (cart) {
      const order = new Order({
        user: userId,
        OrderItems: cart.cartItems,
        shippingAddress: JSON.parse(shippingAddress),
        totalOrderPrice: session.amount_total / 100, // Convert from cents
        paymentType: 'card',
        isPaid: true,
        PaidAt: new Date(),
      });

      await order.save();

      // Update product stock
      const options = cart.cartItems.map(item => ({
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { sold: item.quantity, stock: -item.quantity } },
        },
      }));

      await Product.bulkWrite(options);
      await Cart.findByIdAndDelete(cartId);
    }
  }

  res.status(200).json({ received: true });
});

// Get User Orders
const getUserOrders = catchError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .populate(
      'OrderItems.product',
      'name title imageCover price priceAfterDiscount brand category'
    )
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return res.status(200).json({
      message: 'No orders found for this user',
      orders: [],
    });
  }

  res.status(200).json({
    message: 'success',
    count: orders.length,
    orders,
  });
});

// Get All Orders (Admin)
const getAllOrders = catchError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({})
    .populate(
      'OrderItems.product',
      'name title imageCover price priceAfterDiscount brand category'
    )
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments();

  if (!orders || orders.length === 0) {
    return res.status(200).json({
      message: 'No orders found',
      orders: [],
    });
  }

  res.status(200).json({
    message: 'success',
    count: orders.length,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    orders,
  });
});

// Get Single Order
const getOrderById = catchError(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate(
      'OrderItems.product',
      'name title imageCover price priceAfterDiscount brand category'
    )
    .populate('user', 'name email');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user owns this order or is admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to access this order', 403));
  }

  res.status(200).json({
    message: 'success',
    order,
  });
});

// Update Order Status (Admin)
const updateOrderStatus = catchError(async (req, res, next) => {
  const { orderId } = req.params;
  const { isDelivered, isPaid } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (isDelivered !== undefined) {
    order.isDelivered = isDelivered;
    if (isDelivered) {
      order.deliveredAt = new Date();
    }
  }

  if (isPaid !== undefined) {
    order.isPaid = isPaid;
    if (isPaid) {
      order.PaidAt = new Date();
    }
  }

  await order.save();

  res.status(200).json({
    message: 'Order updated successfully',
    order,
  });
});

export {
  createCashOrder,
  createOnlinePayment,
  handleStripeWebhook,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
