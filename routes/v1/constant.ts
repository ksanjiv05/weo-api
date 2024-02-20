import express from "express";
import { getServiceUnits } from "../../controllers/constantController/constant";

const router = express.Router();

router.get("/constants/service_units", getServiceUnits);

export default router;
