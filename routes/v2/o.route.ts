// Objective : This file is responsible for handling the routes for the listed module.
//Author : Sanjiv kumar pandit

import express from "express";
import { auth } from "../../middleware/auth";
import { oRewardCalculate } from "../../controllers/v2/oController/o";
import { oNetworkConfig } from "../../config/config";

const router = express.Router();

router.post("/o/reward", auth, oRewardCalculate);
router.get("/o/config", auth, (req, res) => {
  res.json(oNetworkConfig);
});

export default router;
