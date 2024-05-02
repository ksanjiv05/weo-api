import express from "express";
import {
  getBrandSubCategories,
  getCategories,
  getSubAllCategories,
  getSubCategories,
  updateCategory,
} from "../../controllers/v2/categoryController/categoryV2";
import { addCategory } from "../../controllers/v2/categoryController/categoryV2";
import { auth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
const router = express.Router();

//category routes
router.post("/categories", auth, addCategory);
router.put("/categories", auth, updateCategory);
router.get("/categories", getCategories);
router.get("/categories/sub_categories", getSubAllCategories);

router.get("/categories/brand/:id", getBrandSubCategories);
router.get("/categories/:id", getSubCategories);

export default router;
