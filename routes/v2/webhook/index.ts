import express from "express";
import razorpayRoute from "./razorpay.route";
const webhookRouterV2 = express.Router();

webhookRouterV2.use(razorpayRoute);

export default webhookRouterV2;
