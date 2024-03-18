import express from "express";
import {
  getBrandSubCategories,
  getCategories,
  getSubCategories,
} from "../../controllers/v1/categoryController/category";
import { auth } from "../../middleware/auth";
const router = express.Router();

//category routes
router.get("/categories", auth, getCategories);
router.get("/categories/brand/:id", getBrandSubCategories);
router.get("/categories/:id", getSubCategories);

export default router;
