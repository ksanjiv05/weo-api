import express from "express";
import {
  getBrandSubCategories,
  getCategories,
  getSubCategories,
} from "../../controllers/categoryController/category";
const router = express.Router();

//category routes
router.get("/categories", getCategories);
router.get("/categories/brand/:id", getBrandSubCategories);
router.get("/categories/:id", getSubCategories);

export default router;
