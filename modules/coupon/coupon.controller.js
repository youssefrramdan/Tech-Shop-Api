import { catchError } from "../../middlewares/catchError.js";
import { Coupon } from "../../models/Coupon.model.js";

const addCoupon = catchError(async (req, res, next) => {
  let isExist = await Coupon.findOne({code :req.body.code})
  if (isExist) {
    return res.status(404).json({ message: "this is exist" });

  }
  let coupon = new Coupon(req.body);
  await coupon.save();
  res.json({ message: "success", coupon });
});

const allCoupons = catchError(async (req, res, next) => {
  let coupons = await Coupon.find();
  res.json({ message: "success", coupons });
});

const getCoupon = catchError(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError('coupon not found', 404));
  res.json({ message: "success", coupon });
});
const updateCoupon = catchError(async (req, res, next) => {
  let coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,  
  });

  if (!coupon) return next(new AppError('coupon not found', 404));
  
  res.json({ message: "success", coupon });
});
const deleteCoupon = catchError(async (req, res, next) => {
  let coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) return next(new AppError('coupon not found', 404));

  res.json({ message: "coupon deleted successfully" });
});

export {
  addCoupon, allCoupons ,getCoupon ,updateCoupon, deleteCoupon
}