import express from "express";
import { auth } from "../../middleware/auth";
import {
  collectOffer,
  getCollectedOfferDetails,
  getCollectedOffers,
  getNumberOfAttempts,
} from "../../controllers/v2/collectedController/collected";
import { negotiationAttempt } from "../../middleware/negotiationAttempt";

const router = express.Router();

router.post("/collects", auth, negotiationAttempt, collectOffer);
router.get("/collects/:id", auth, getCollectedOfferDetails);
router.get("/collects/attempt", auth, getNumberOfAttempts);
router.get("/collects", auth, getCollectedOffers);

export default router;
