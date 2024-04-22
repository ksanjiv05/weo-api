import express from "express";
import { createCustomer, deposit } from "../../payment/stripe";

const router = express.Router();

router.post("/customer", createCustomer);

router.post("/deposit", deposit);

export default router;
