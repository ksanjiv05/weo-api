import express from "express";
import { getCategories } from "../../controllers/categoryController/category";
const router = express.Router();

//category routes
router.get("/categories", getCategories);

export default router;
