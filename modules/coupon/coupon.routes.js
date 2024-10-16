import { Router } from "express"
import { addCoupon, allCoupons, deleteCoupon, updateCoupon} from "./coupon.controller.js"

const couponRouter= Router()

couponRouter.route('/')
.post(addCoupon)
.get(allCoupons)
.put(updateCoupon)
.delete(deleteCoupon)

export{
  couponRouter 
}