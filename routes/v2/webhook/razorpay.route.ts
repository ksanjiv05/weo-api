import express from "express";
import { paymentWebhook } from "../../../webhooks/v2/payment/razorpay.webhook";

const router = express.Router();

router.post("/payments", paymentWebhook);

export default router;
