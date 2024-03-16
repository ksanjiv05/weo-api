import express from "express";
import { auth } from "../../middleware/auth";
import {
  collectOffer,
  getCollectedOffers,
} from "../../controllers/v1/collectorController/collector";
import { collectorDataValidate } from "../../middleware/validator/collectorValidator";

const router = express.Router();

router.post("/collect/offers", collectorDataValidate, auth, collectOffer);
router.get("/collect/offers", auth, getCollectedOffers);

export default router;
