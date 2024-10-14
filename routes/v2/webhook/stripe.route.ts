import express from "express";
import { paymentWebhook } from "../../../webhooks/v2/payment/stripe.webhook";

const router = express.Router();

router.post(
  "/stripe/event",
  express.raw({ type: "application/json" }),
  paymentWebhook
);

export default router;
