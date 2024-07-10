// Objective : Define all routes and swagger documentation for the brand
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gamil.com)

// Import necessary modules
import express from "express";
import {
  addBrand,
  deleteBrand,
  deleteBrands,
  getBrandById,
  getBrandByName,
  getBrands,
  getBrandsByLocation,
  updateBrand,
} from "../../controllers/v2/brandController/brand";
import { auth } from "../../middleware/auth";
import { addBrandValidation } from "../../middleware/validator/v2/brand.validation";
import { getOutletsByBrandId } from "../../controllers/v2/outletController/outlet";

const router = express.Router();

/**
 * @swagger
 * /v2/brands:
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
 * /brands:
 *   get:
 *     summary: Retrieve a list of brands
 *     tags: [Brand]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to retrieve
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: ""
 *         description: Status filter for the brands
 *       - in: query
 *         name: location
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Flag to filter by location
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *           nullable: true
 *           default: null
 *         description: Latitude for location-based filtering
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *           nullable: true
 *           default: null
 *         description: Longitude for location-based filtering
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: integer
 *           default: 10000
 *         description: Maximum distance for location-based filtering (in meters)
 *     responses:
 *       '200':
 *         description: A list of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 error:
 *                   type: string
 *                   nullable: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     brands:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                 code:
 *                   type: integer
 *                   example: 200
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

router.get("/brands", auth, getBrands);
router.get("/brands/location", getBrandsByLocation);

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
 * /v2/brands/name/{name}:
 *   get:
 *     summary: Get a brand by name
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Brand name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get a brand by id
 *       500:
 *         description: Brand not found
 */
router.get("/brands/name/:name", auth, getBrandByName);

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
router.delete("/brands", auth, deleteBrands);

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
