import { catchError } from "../../middlewares/catchError.js";
import { Cart } from "../../models/Cart.model.js";
import { Coupon } from "../../models/Coupon.model.js";
import { Product } from "../../models/Product.model.js";
import { AppError } from "../../utils/appError.js";

// إضافة منتج إلى السلة
const addToCart = catchError(async (req, res, next) => {
  const { product: productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));

  if (quantity > product.stock) {
    return next(new AppError("Insufficient stock", 404));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          quantity,
          price: product.price,
          image: product.imageCover,
        },
      ],
      totalCartPrice: product.price * quantity,
    });
  } else {
    const existingItem = cart.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity > product.stock) {
        return next(new AppError("Insufficient stock", 404));
      }
    } else {
      cart.cartItems.push({
        product: productId,
        quantity,
        price: product.price,
        image: product.imageCover,
      });
    }

    cart.totalCartPrice = cart.cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  await cart.save();
  return res.json({ message: "success", cart });
});

// تحديث كمية منتج في السلة
const updateProductQuantity = catchError(async (req, res, next) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new AppError("Invalid quantity value", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  const item = cart.cartItems.find(
    (item) => item._id.toString() === cartItemId
  );
  if (!item) return next(new AppError("Product not in cart", 404));

  const product = await Product.findById(item.product);
  if (!product) return next(new AppError("Product not found", 404));

  if (quantity > product.stock) {
    return next(new AppError("Insufficient stock", 404));
  }

  item.quantity = quantity;

  cart.totalCartPrice = cart.cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  await cart.save();

  return res.json({ message: "Product quantity updated successfully", cart });
});

// حذف منتج من السلة
const removeItemFromCart = catchError(async (req, res, next) => {
  const cartItemId = req.params.id;

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: cartItemId } } },
    { new: true }
  );

  if (!cart) return next(new AppError("Cart not found", 404));

  cart.totalCartPrice = cart.cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  await cart.save();

  return res.json({ message: "Item removed successfully", cart });
});

// جلب بيانات السلة للمستخدم الحالي
const getLoggedUser = catchError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "cartItems.product"
  );

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const formattedCartItems = cart.cartItems.map((item) => ({
    id: item._id,
    product: {
      id: item.product._id,
      name: item.product.name,
      image: item.product.imageCover,
      price: item.product.price,
    },
    quantity: item.quantity,
    price: item.price,
  }));

  return res.json({
    message: "Cart retrieved successfully",
    cart: { ...cart._doc, cartItems: formattedCartItems },
  });
});

// إفراغ السلة بالكامل
const clearUserCart = catchError(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ user: req.user._id });

  if (!cart) return next(new AppError("Cart not found", 404));
  return res.json({ message: "cart removed successfully" });
});

// تطبيق كود خصم على السلة
const applyCoupon = catchError(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    code: req.body.code,
    expires: { $gte: Date.now() },
  });
  if (!coupon) return next(new AppError("Opps coupon invalid", 404));

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  cart.totalCartPriceAfterDiscount =
    cart.totalCartPrice - (cart.totalCartPrice * coupon.discount) / 100;

  if (cart.totalCartPriceAfterDiscount < 0) cart.totalCartPriceAfterDiscount = 0;

  cart.discount = coupon.discount;
  await cart.save();

  await Coupon.findByIdAndDelete(coupon._id);

  res.json({ message: "success", cart });
});

// تصدير الوظائف
export {
  addToCart,
  updateProductQuantity,
  removeItemFromCart,
  getLoggedUser,
  clearUserCart,
  applyCoupon,
};
