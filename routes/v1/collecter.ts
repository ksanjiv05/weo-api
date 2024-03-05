import express from "express";
import { auth } from "../../middleware/auth";
import {
  collectOffer,
  getCollectedOffers,
} from "../../controllers/collectorController/collector";

const router = express.Router();

router.post("/collect/offers", auth, collectOffer);
router.get("/collect/offers", auth, getCollectedOffers);

export default router;
