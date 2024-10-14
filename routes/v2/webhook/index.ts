import express from "express";
import razorpayRoute from "./razorpay.route";
import stripeRoute from "./stripe.route";
const webhookRouterV2 = express.Router();

webhookRouterV2.use(razorpayRoute);
webhookRouterV2.use(stripeRoute);

export default webhookRouterV2;
