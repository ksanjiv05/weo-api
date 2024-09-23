import express from "express";
import {
  createCustomer,
  createPaymentIntent,
  deposit,
} from "../../payment/stripe";

const router = express.Router();

router.post("/customer", createCustomer);
router.post("/deposit", deposit);
router.post("/create-payment-intent", createPaymentIntent);

export default router;
