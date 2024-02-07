import mongoose from "mongoose";

//* creating coupon schema
const CouponSchema = new mongoose.Schema({
 code: {
  type: String,
  required: [true, "Please enter the coupon code!"],
  unique: true
 },
 amount: {
  type: Number,
  required: [true, "Please enter the discount amount!"]
 }
})

//* creating coupon model
export const CouponModel = mongoose.model("coupons", CouponSchema);
