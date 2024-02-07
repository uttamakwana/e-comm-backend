import { TryCatch } from '../middlewares/Error.js';
import { Request } from 'express';
import { OrderItemType, OrderType } from '../types/Order.js';
import { OrderModel } from '../models/Order.js';
import { reduceStock } from '../utils/ReduceStock.js';
import ErrorHandler from '../utils/Error.js';
import { invalidateCache } from '../utils/Revalidate.js';
import { myCache } from '../app.js';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// to create a new order
// route: orders/create
// POST
// Public
export const createOrder = TryCatch(async (req: Request<{}, {}, OrderType>, res, next) => {
 const { shippingInfo, user, discount, tax, shippingCharge, subTotal, total, status, orderItems } = req.body;

 // check if all details are inputed
 if (!shippingInfo || !user || !subTotal || !total || !orderItems || !tax) return next(new ErrorHandler("Pleae provide all the necessary details!", 400));

 // Check if orderItems is an array
 if (!Array.isArray(orderItems)) {
  return next(new ErrorHandler("Please provide orderItems as an array!", 400))
 }

 // creating an order
 const order = await OrderModel.create({ shippingInfo, user, discount, tax, shippingCharge, subTotal, total, status, orderItems })

 // reducing stocks
 await reduceStock(orderItems);

 // invaldating the cache memory
 invalidateCache({ order: true, product: true, admin: true, userId: user, productId: order.orderItems.map(product => String(product.productId)) });

 // giving back the response
 return res.status(200).json({ success: true, message: "Order placed successfully!" })
})

// it will give all your orders
// router: orders/my/:id
// GET
// Public
export const myOrders = TryCatch(async (req, res, next) => {
 const { id } = req.params;
 let orders = [];

 // checking orders in cache memory
 if (myCache.has(`my-orders-${id}`)) {
  orders = JSON.parse(myCache.get(`my-orders-${id}`) as string);
 } else {
  // find the user with id inside the orders
  orders = await OrderModel.find({ user: id });
  myCache.set(`my-orders-${id}`, JSON.stringify(orders));
 }

 // giving back the user's orders
 return res.status(200).json({ success: true, message: "Orders retrieved successfully!", orders });
})

// it will give all orders
// route: orders/all
// GET
// Private
export const allOrders = TryCatch(async (req, res, next) => {
 let orders;
 // checking if all-orders exist in cache memory or not
 if (myCache.has("all-orders")) {
  orders = JSON.parse(myCache.get("all-orders") as string);
 } else {
  // finding orders with name of user who have placed order!
  orders = await OrderModel.find({}).populate("user", "name");
  myCache.set("all-orders", JSON.stringify(orders));
 }

 // giving back the all the orders
 return res.status(200).json({ success: true, message: "Orders retrieved successfully!", orders });
})

// it will give single order details
// route: orders/:id
// GET
// Public
export const singleOrder = TryCatch(async (req, res, next) => {
 const { id } = req.params;
 let order;

 // checking if single-order is in cache or not
 if (myCache.has(`order-${id}`)) {
  order = JSON.parse(myCache.get(`order-${id}`) as string);
 } else {
  // finding order
  order = await OrderModel.findById(id);
  // order not found!
  if (!order) return next(new ErrorHandler("Order not found!", 404));
  // seting in cache memory
  myCache.set(`order-${id}`, JSON.stringify(order));
 }

 // giving back single order details
 return res.status(200).json({ success: true, message: `Order retrieved successfully`, order })
});

// it will process the order
// route: orders/:id
// PUT
// Private
export const processOrder = TryCatch(async (req, res, next) => {
 const { id } = req.params;
 // finding order
 const order = await OrderModel.findById(id);
 console.log(order?.user);
 // const userID = order?.user;
 // order not found!
 if (!order) return next(new ErrorHandler("Order not found!", 404));
 // to process the order if order status is "processing" then we will convert it into shipped and if it is in "shipped" then we will convert it into the "delivered"
 switch (order.status) {
  case "Processing":
   order.status = "Shipped";
   break;
  case "Shipped":
   order.status = "Delivered"
   break;
  default:
   order.status = "Delivered";
   break;
 }

 // saving the order
 await order.save();
 // removing cache
 invalidateCache({ product: false, order: true, admin: true, userId: order?.user as ObjectId, orderId: id })
 // giving back the reponse
 return res.status(201).json({ success: true, message: "Order processed successfully!", order })
})

// to delete an order
// route: orders/:id
// DELETE
// Private
export const deleteOrder = TryCatch(async (req, res, next) => {
 const { id } = req.params;

 // find the product
 const order = await OrderModel.findById(id);

 // if order not found
 if (!order) return next(new ErrorHandler("Order not found!", 404));

 // delete an order
 await order.deleteOne();
 // remove the cache
 invalidateCache({ product: false, order: true, admin: true, userId: order?.user as ObjectId, orderId: id })

 // give back the response
 return res.status(200).json({ success: true, message: "Order deleted successfully", order })
})

