import express from "express";
import {
  getBrandSubCategories,
  getCategories,
  getSubCategories,
} from "../../controllers/v2/categoryController/categoryV2";
import { addCategory } from "../../controllers/v2/categoryController/categoryV2";
import { auth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
const router = express.Router();

//category routes
router.post("/categories", addCategory);
router.get("/categories", getCategories);
router.get("/categories/brand/:id", getBrandSubCategories);
router.get("/categories/:id", getSubCategories);

export default router;
