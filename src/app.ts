import express from "express";
import dotenv from "dotenv";
import NodeCache from 'node-cache';
// routers
import { userRouter, productRouter, orderRouter, paymentRouter, statsRouter } from './routes/index.js';
// database
import { connectToDB } from './database/connection.js';
// middleware
import { errorMiddleware } from "./middlewares/Error.js";
// morgan
import morgan from 'morgan';
// stripe
import Stripe from 'stripe';
// cors
import cors from "cors";

//* config:
// to access environment variables
dotenv.config();
// to connect to the database
connectToDB()
// stripe key
const STRIPE_KEY = process.env.STRIPE_KEY || "";
// creating stripe instance
export const stripe = new Stripe(STRIPE_KEY);
// creating our cache memory instance
export const myCache = new NodeCache();
// creating our app
const app = express();
// cors policiees
app.use(cors());
// creating our PORT
const PORT = process.env.PORT || 3000;

//* middlewares:
// to parse req.body json data into array and objects
app.use(express.json());
// morgan middleware for getting clinet request information in console.log()
app.use(morgan("dev"))

//* routers:
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);
app.use("/stats", statsRouter);
// we are statically uploading the 'upload' folder so that we can access this images in frontend or from anywhere
app.use("/uploads", express.static("uploads"));

// handling error handler
// every next(new ErrorHandler("message", statusCode)) will go through this middleware
app.use((errorMiddleware));

//* listning to server
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
