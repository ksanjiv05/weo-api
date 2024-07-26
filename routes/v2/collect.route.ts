import express from "express";
import { auth } from "../../middleware/auth";
import { collectOffer } from "../../controllers/v2/collectedController/collected";

const router = express.Router();

// collect routes
//create order

router.post("/collects", auth, collectOffer);

export default router;
