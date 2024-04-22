import express from "express";

import {
  createQuantity,
  getQuantities,
} from "../../controllers/v2/quantityController/quantity";

const router = express.Router();

// Quantity routes
router.post("/quantities", createQuantity);
router.get("/quantities", getQuantities);

export default router;
