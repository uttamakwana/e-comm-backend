import express from "express";
import { allOrders, createOrder, deleteOrder, myOrders, processOrder, singleOrder } from '../controllers/Order.js';
import { adminAuth } from '../middlewares/Auth.js';
const router = express.Router();
//* handling routes
// all orders | Admin
router.get("/all", adminAuth, allOrders);
// to create a new order
router.post("/create", createOrder);
// my orders
router.get("/my/:id", myOrders);
// get a single order details
router.get("/:id", singleOrder);
// process the order/update the order status
router.put("/:id", adminAuth, processOrder);
// delete an order
router.delete("/:id", adminAuth, deleteOrder);
//* exporting router
export default router;
