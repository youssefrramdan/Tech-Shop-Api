import Cart from '../models/Cart.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import ApiError from '../utils/apiError.js';
import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Create Cash Order
const createCashOrder = asyncHandler(async (req, res, next) => {
  const { cartId } = req.params;

  let cart = await Cart.findById(cartId).populate('cartItems.product');
  if (!cart) return next(new ApiError('Cart not found', 404));

  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new ApiError('Not authorized to access this cart', 403));
  }

  let totalOrderPrice = cart.totalCartPriceAfterDiscount || cart.totalCartPrice;

  // Check if this is a completed Stripe payment
  const { completedPayment, paymentType, isPaid } = req.body;
  const isStripePayment = completedPayment && paymentType === 'card';

  let order = new Order({
    user: req.user._id,
    OrderItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentType: isStripePayment ? 'card' : 'cash',
    isPaid: isStripePayment ? true : false,
    PaidAt: isStripePayment ? new Date() : undefined,
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
    return next(new ApiError('Failed to update product stock', 500));
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
const createOnlinePayment = asyncHandler(async (req, res, next) => {
  const { cartId } = req.params;

  let cart = await Cart.findById(cartId).populate('cartItems.product');
  if (!cart) return next(new ApiError('Cart not found', 404));

  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new ApiError('Not authorized to access this cart', 403));
  }

  // Validate cart items
  if (!cart.cartItems || cart.cartItems.length === 0) {
    return next(new ApiError('Cart is empty', 400));
  }

  let totalOrderPrice = cart.totalCartPriceAfterDiscount || cart.totalCartPrice;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.cartItems.map(item => {
        const productName =
          item.product?.name || item.product?.title || 'Product';
        const productPrice = item.price || item.product?.price || 0;
        const productQuantity = item.quantity || 1;

        return {
          price_data: {
            currency: 'usd', // USD is more widely supported
            product_data: {
              name: productName,
              description:
                item.product?.description ||
                `${productName} - High quality product`,
              images: item.product?.imageCover ? [item.product.imageCover] : [],
            },
            unit_amount: Math.round(productPrice * 100), // Convert to cents
          },
          quantity: productQuantity,
        };
      }),
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/cart?canceled=true`,
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
  } catch (error) {
    return next(
      new ApiError('Failed to create payment session: ' + error.message, 500)
    );
  }
});

// Webhook to handle successful payment
const handleStripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
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
        metadata: { sessionId: session.id },
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

// Verify Payment Success (fallback method)
const verifyPaymentSuccess = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const { cartId, userId, shippingAddress } = session.metadata;

      // Check if order already exists
      const existingOrder = await Order.findOne({
        user: userId,
        'metadata.sessionId': sessionId,
      });

      if (!existingOrder) {
        const cart = await Cart.findById(cartId).populate('cartItems.product');
        if (cart) {
          const order = new Order({
            user: userId,
            OrderItems: cart.cartItems,
            shippingAddress: JSON.parse(shippingAddress),
            totalOrderPrice: session.amount_total / 100,
            paymentType: 'card',
            isPaid: true,
            PaidAt: new Date(),
            metadata: { sessionId },
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

          return res.status(200).json({
            message: 'Payment verified and order created successfully',
            success: true,
            order: order._id,
          });
        }
      }

      return res.status(200).json({
        message: 'Payment already processed',
        success: true,
      });
    } else {
      return res.status(400).json({
        message: 'Payment not completed',
        success: false,
      });
    }
  } catch (error) {
    return next(new ApiError('Failed to verify payment', 500));
  }
});

// Get User Orders
const getUserOrders = asyncHandler(async (req, res, next) => {
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
const getAllOrders = asyncHandler(async (req, res, next) => {
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
    data: orders,
  });
});

// Get Single Order
const getOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate(
      'OrderItems.product',
      'name title imageCover price priceAfterDiscount brand category'
    )
    .populate('user', 'name email');

  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Check if user owns this order or is admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new ApiError('Not authorized to access this order', 403));
  }

  res.status(200).json({
    message: 'success',
    order,
  });
});

// Update Order Status (Admin)
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, isDelivered, isPaid } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Update status if provided
  if (status !== undefined) {
    order.status = status;

    // Auto-update related fields based on status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }
  }

  // Legacy support for isDelivered and isPaid
  if (isDelivered !== undefined) {
    order.isDelivered = isDelivered;
    if (isDelivered) {
      order.deliveredAt = new Date();
      order.status = 'delivered';
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
    data: order,
  });
});

/**
 * @desc    Get Order Statistics
 * @route   GET /api/v1/admin/stats/orders
 * @access  Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $facet: {
        totalOrders: [{ $count: 'count' }],
        totalRevenue: [
          {
            $group: {
              _id: null,
              total: { $sum: '$totalOrderPrice' },
            },
          },
        ],
        ordersByStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        recentOrders: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              totalOrderPrice: 1,
              status: 1,
              'user.name': 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalOrders: stats[0].totalOrders[0]?.count || 0,
      totalRevenue: stats[0].totalRevenue[0]?.total || 0,
      ordersByStatus: stats[0].ordersByStatus,
      recentOrders: stats[0].recentOrders,
    },
  });
});

export {
  createCashOrder,
  createOnlinePayment,
  handleStripeWebhook,
  verifyPaymentSuccess,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
};
