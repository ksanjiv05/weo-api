import express from "express";
import { newTopUpOrder } from "../../controllers/v2/paymentController/rPay";
import { auth } from "../../middleware/auth";

const router = express.Router();

//create order

router.post("/orders/topup", auth, newTopUpOrder);
router.post("/orders/purchase", auth, newTopUpOrder);

export default router;
