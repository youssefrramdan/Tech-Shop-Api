import { catchError } from "../../middlewares/catchError.js";
import { Cart } from "../../models/Cart.model.js";
import { Coupon } from "../../models/Coupon.model.js";
import { Product } from "../../models/Product.model.js";
import { AppError } from "../../utils/appError.js";

const addToCart = catchError(async (req, res, next) => {
  let isCartExist = await Cart.findOne({ user: req.user._id });
  
  let product = await Product.findById(req.body.product);
  if (!product) return next(new AppError('Product not found', 404));

  req.body.price = product.price;

  if (req.body.quantity > product.stock) return next(new AppError('Sold out', 404));

  if (!isCartExist) {
    let cart = new Cart({
      user: req.user._id,
      cartItems: [{
        product: req.body.product,
        quantity: req.body.quantity || 1,
        price: req.body.price,
      }],
    });
    
    await cart.save();
    return res.json({ message: "success", cart });
  } else {
    let item = isCartExist.cartItems.find(item => item.product == req.body.product);
    
    if (item) {
      item.quantity += req.body.quantity || 1;
      if (item.quantity > product.stock) return next(new AppError('Sold Out', 404));
    } else {
      isCartExist.cartItems.push({
        product: req.body.product,
        quantity: req.body.quantity || 1,
        price: req.body.price,
      });
    }

    isCartExist.totalCartPrice = isCartExist.cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await isCartExist.save();
    return res.json({ message: "success", cart: isCartExist });
  }
}
);

const updateProductQuantity = catchError(async (req, res, next) => {
  const productId = req.params.id;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  let product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  let item = cart.cartItems.find(item => item.product.toString() === productId);
  if (!item) return next(new AppError('Product not in cart', 404));

  item.quantity = req.body.quantity;

  if (item.quantity > product.stock) {
    return next(new AppError('Insufficient stock', 404));
  }

  cart.totalCartPrice = cart.cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  await cart.save();
  return res.json({ message: "Product quantity updated successfully", cart });
});
const removeItemFromCart = catchError(async (req, res, next) => {
  // البحث عن السلة الحالية للمستخدم
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id }, // تحديد السلة الخاصة بالمستخدم
    { $pull: { cartItems: { _id: req.params.id } } }, // حذف العنصر من السلة
    { new: true } // إرجاع السلة المحدثة
  );

  // التحقق من وجود السلة بعد العملية
  if (!cart) return next(new AppError('Cart not found', 404));

  return res.json({ message: "Item removed successfully", cart });
});

const getLoggedUser = catchError(async (req, res, next) => {
  const cart = await Cart.findOne({user : req.user._id})
  if (!cart) return next(new AppError('Cart not found', 404));

  return res.json({ message: "Item removed successfully", cart });
});

const clearUserCart = catchError(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({user : req.user._id})

  if (!cart) return next(new AppError('Cart not found', 404));
  return res.json({ message: "cart removed successfully"});
});

const applyCoupon = catchError(async (req, res, next) => {
  let coupon = await Coupon.findOne({ code: req.body.code, expires: { $gte: Date.now() } });
  if (!coupon) return next(new AppError('Opps coupon invalid', 404));

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.totalCartPriceAfterDiscount = 
    cart.totalCartPrice - (cart.totalCartPrice * coupon.discount) / 100;
  
  if (cart.totalCartPriceAfterDiscount < 0) cart.totalCartPriceAfterDiscount = 0;

  cart.discount = coupon.discount;
  await cart.save();

  await Coupon.findByIdAndDelete(coupon._id);

  res.json({ message: "success", cart });
});



export { addToCart ,updateProductQuantity , removeItemFromCart ,getLoggedUser,clearUserCart , applyCoupon};
