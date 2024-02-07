import { myCache, stripe } from '../app.js';
import { TryCatch } from '../middlewares/Error.js';
import { CouponModel } from '../models/Coupon.js';
import ErrorHandler from '../utils/Error.js';
import { invalidateCache } from '../utils/Revalidate.js';
// to create a new coupon
// route: payments/coupon/create
// POST
// Public
export const createCoupon = TryCatch(async (req, res, next) => {
    const { code, amount } = req.body;
    // if code, amount has not inputed
    if (!code || !amount)
        return next(new ErrorHandler("Please enter all details!", 400));
    // creating a coupon
    const coupon = await CouponModel.create({ code, amount });
    // invalidate cache memory: whenever new coupon adds we want to refresh the cache memory otherwise it will not show all coupon code
    invalidateCache({ admin: true });
    // giving back coupon
    return res.status(200).json({ success: true, message: "Coupon created successfully!", coupon });
});
// to apply the discount on product with the entered coupon code
// route: payments/discount
// POST
// Public
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    // if coupon code is not entered
    if (!coupon)
        return next(new ErrorHandler("Please give a valid coupon code!", 400));
    // find the amount of discount with attached coupon code
    const discount = await CouponModel.findOne({ code: coupon });
    // if no discount found
    if (!discount)
        return next(new ErrorHandler("No coupon code found!", 404));
    // give back the amount of discount
    return res.status(200).json({ success: true, discount: discount.amount });
});
// to see all coupon code available
// route: payments/coupon/all
// GET
// Private
export const allCoupons = TryCatch(async (req, res, next) => {
    let coupons;
    // check coupons in cache memory
    if (myCache.has("coupons")) {
        coupons = JSON.parse(myCache.get("coupons"));
    }
    else {
        coupons = await CouponModel.findOne({});
        myCache.set("coupons", JSON.stringify(coupons));
    }
    return res.status(200).json({ success: true, coupons });
});
// to delete coupon code
// route: payments/coupon?code=""
// DELETE
// Private
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { code } = req.query;
    // check coupon code inputed or not
    if (!code)
        return next(new ErrorHandler("Please enter valid coupon code!", 400));
    // find coupon
    const coupon = await CouponModel.findOne({ code });
    // error if not coupon
    if (!coupon)
        return next(new ErrorHandler("Coupon doesn't exist!", 404));
    // delete coupon
    await coupon.deleteOne();
    // invalidate cache memory
    invalidateCache({ admin: true });
    // give back the response
    return res.status(200).json({ success: true, message: "Coupon deleted successfully", coupon });
});
// to create a payment with stripe
// route: payments/create
// POST
// Public
export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new ErrorHandler("Please enter amount!", 400));
    // we are creating an intent of payment and rest will handle stripe itself
    // Number(amount) * 100: as stripe will take it as in paisa (100 paisa = 1 Rs)
    const paymentIntent = await stripe.paymentIntents.create({ amount: Number(amount) * 100, currency: "inr" });
    // give back the response
    return res.status(201).json({ success: true, clientSecret: paymentIntent.client_secret });
});
