import mongoose from 'mongoose';

//* creating order schema
const OrderSchema = new mongoose.Schema({
 shippingInfo: {
  address: {
   type: String,
   required: [true, "Please enter your address!"]
  },
  city: {
   type: String,
   required: [true, "Please enter your city!"]
  },
  state: {
   type: String,
   required: [true, "Please enter your state!"]
  },
  country: {
   type: String,
   required: [true, "Please enter your country!"]
  },
  pincode: {
   type: Number,
   required: [true, "Please enter your pincode!"]
  }
 },
 user: {
  type: mongoose.Types.ObjectId,
  ref: "users",
  required: [true, "Please enter your userID"]
 },
 discount: {
  type: Number,
  required: [true, "Please enter your discount!"]
 },
 tax: {
  type: Number,
  required: [true, "Please enter your tax!"]
 },
 shippingCharge: {
  type: Number,
  required: [true, "Please enter shipping charge!"]
 },
 subTotal: {
  type: Number,
  required: [true, "Please enter your sub total!"]
 },
 total: {
  type: Number,
  required: [true, "Please enter yout total amount!"]
 },
 status: {
  type: String,
  enum: ["Processing", "Shipped", "Delivered"],
  default: "Processing",
 },
 orderItems: [
  {
   name: String,
   photo: String,
   price: Number,
   quantity: Number,
   productId: {
    type: mongoose.Types.ObjectId,
    ref: "products",
   }
  }
 ]
}, { timestamps: true });

//* exporting order model
export const OrderModel = mongoose.model("orders", OrderSchema);
