import express from "express";
import { auth } from "../../middleware/auth";
import {
  collectOffer,
  getCollectedOfferDetails,
  getCollectedOfferQr,
  getCollectedOffers,
  getNumberOfAttempts,
  reSellCollectedOffer,
} from "../../controllers/v2/collectedController/collected";
import { negotiationAttempt } from "../../middleware/negotiationAttempt";

const router = express.Router();

router.post("/collects", auth, negotiationAttempt, collectOffer);
router.get("/collects",auth, getCollectedOffers);
router.get("/collects/attempt", auth, getNumberOfAttempts);
router.get("/collects/qr/:id", auth, getCollectedOfferQr);
router.get("/collects/:id", auth, getCollectedOfferDetails);
router.post("/collected/resell/:id",auth,reSellCollectedOffer)


export default router;
