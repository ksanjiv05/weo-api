// Objective : Define all routes and swagger documentation for the brand
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gamil.com)

// Import necessary modules
import express from "express";
import { addBrand } from "../../controllers/v2/brandController/brand";
import { auth } from "../../middleware/auth";
import { addBrandValidation } from "../../middleware/validator/v2/brand.validation";

const router = express.Router();

/**
 * @swagger
 * /v2/brand:
 *   post:
 *     summary: Add a brand
 *     tags: [Brand]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brandName:
 *                 type: string
 *               brandDescription:
 *                 type: string
 *               brandLogo:
 *                 type: string
 *               user:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               status:
 *                 type: number
 *               checkpoint:
 *                 type: number
 *     responses:
 *       201:
 *         description: Brand added successfully
 *       400:
 *         description: fields are required
 *       500:
 *         description: Brand not saved
 */

router.post("/", auth, addBrandValidation, addBrand);

export default router;
