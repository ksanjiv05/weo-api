// Objective : This file is responsible for handling the routes for the listed module.
//Author : Sanjiv kumar pandit

import express from "express";
import { auth } from "../../middleware/auth";
import {
  createListed,
  getAllListedBrands,
  getAllListedOffersByBrand,
} from "../../controllers/v2/listedController/listed";

const router = express.Router();

/**
 * @swagger
 * /v2/listed:
 *   post:
 *     summary: Add a listed
 *     tags: [Listed]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               ownership:
 *                 type: array
 *               offer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Listed added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *       503:
 *         description: Service unavailable
 */
router.post("/listed", auth, createListed);

// //brandName: 1,
//           brandDescription: 1,
//           brandLogo: 1,
//           categoryId: 1,
//           status: 1,
//           checkpoint: 1,
//           outlets: 1,
//           totalPushedOffers: 1,
//           offers: 1,

/**
 * @swagger
 * /v2/listed/user/brand:
 *   get:
 *     summary: Get all brands
 *     tags: [Listed]
 *     responses:
 *       200:
 *         description: Get all brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brandName:
 *                   type: string
 *                 brandDescription:
 *                   type: string
 *                 brandLogo:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                 status:
 *                   type: number
 *                 checkpoint:
 *                   type: number
 *                 outlets:
 *                   type: array
 *                 totalPushedOffers:
 *                   type: number
 *                 offers:
 *                   type: array
 *
 *       500:
 *         description: Internal server error
 *       503:
 *         description: Service unavailable
 */

router.get("/listed/user/brand", auth, getAllListedBrands);
router.get("/listed/user/brand/:id", getAllListedOffersByBrand);

export default router;
