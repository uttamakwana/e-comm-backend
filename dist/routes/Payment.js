import express from "express";
import { allCoupons, applyDiscount, createCoupon, createPaymentIntent, deleteCoupon } from '../controllers/Payment.js';
import { adminAuth } from '../middlewares/Auth.js';
const router = express.Router();
//* handling routes
// create payment
router.post("/create", createPaymentIntent);
// create coupon
router.post("/coupon/create", createCoupon);
// apply discount
router.post("/discount", applyDiscount);
// to see all coupon code
router.get("/coupon/all", adminAuth, allCoupons);
// to delete coupon code
router.delete("/coupon", adminAuth, deleteCoupon);
//* exporting router
export default router;
