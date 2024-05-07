// Objective : Define all routes and swagger documentation for the brand
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gamil.com)

// Import necessary modules
import express from "express";
import {
  addBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "../../controllers/v2/brandController/brand";
import { auth } from "../../middleware/auth";
import { addBrandValidation } from "../../middleware/validator/v2/brand.validation";
import { getOutletsByBrandId } from "../../controllers/v2/outletController/outlet";

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

router.post("/brands", auth, addBrandValidation, addBrand);

/**
 * @swagger
 * /v2/brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brand]
 *     responses:
 *       200:
 *         description: Get all brands
 *       500:
 *         description: Brand not found
 */
router.get("/brands", auth, getBrands);

/**
 * @swagger
 * /v2/brands/{id}:
 *   get:
 *     summary: Get a brand by id
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Brand id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get a brand by id
 *       500:
 *         description: Brand not found
 */
router.get("/brands/:id", auth, getBrandById);

/**
 * @swagger
 * /v2/brands/{id}:
 *   put:
 *     summary: Update a brand by id
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Brand id
 *         schema:
 *           type: string
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
 *       200:
 *         description: Brand updated successfully
 *       400:
 *         description: fields are required
 *       500:
 *         description: Brand not updated
 */

router.put("/brands/:id", auth, addBrandValidation, updateBrand);

/**
 * @swagger
 * /v2/brands/{id}:
 *   delete:
 *     summary: Delete a brand by id
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Brand id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       500:
 *         description: Brand not deleted
 */
router.delete("/brands/:id", auth, deleteBrand);

/**
 * @swagger
 * /v2/brands/{id}/outlets:
 *   get:
 *     summary: Get all outlets by brand id
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Brand id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get all outlets by brand id
 *       500:
 *         description: Outlets not found
 */

router.get("/brands/:id/outlets", auth, getOutletsByBrandId);

// Export the router

export default router;
