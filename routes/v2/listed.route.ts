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
router.post("/listed/:id", auth, createListed);

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

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Offer Service API
 *   description: API for managing offers
 *   version: 1.0.0
 * paths:
 *   /listed/user/brand/{brandId}:
 *     get:
 *       summary: Get offers for a specific brand
 *       description: Retrieve all offers for a specific brand along with the total count of sold status and other details.
 *       parameters:
 *         - name: brandId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *           description: The ID of the brand
 *       responses:
 *         '200':
 *           description: A list of offers
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   offers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The offer ID
 *                         offerName:
 *                           type: string
 *                           description: The name of the offer
 *                         offerDescription:
 *                           type: string
 *                           description: The description of the offer
 *                         soldOffers:
 *                           type: integer
 *                           description: The number of offers sold
 *                         offerThumbnail:
 *                           type: string
 *                           description: Thumbnail URL of the offer
 *                         offerAvailabilityStartDate:
 *                           type: string
 *                           format: date-time
 *                           description: The start date of offer availability
 *                         offerAvailabilityEndDate:
 *                           type: string
 *                           format: date-time
 *                           description: The end date of offer availability
 *                         serviceStartDate:
 *                           type: string
 *                           format: date-time
 *                           description: The start date of the service
 *                         serviceEndDate:
 *                           type: string
 *                           format: date-time
 *                           description: The end date of the service
 *                         offerLiveTillSoldOut:
 *                           type: boolean
 *                           description: Whether the offer is live until sold out
 *                         totalOffersAvailable:
 *                           type: integer
 *                           description: The total number of offers available
 *                   totalListed:
 *                     type: integer
 *                     description: Total number of offers listed
 *                   totalListedOffersCount:
 *                     type: integer
 *                     description: The sum of total offers available
 *                   soldStatusCount:
 *                     type: integer
 *                     description: The total count of offers with a "SOLD" status
 *         '400':
 *           description: Invalid brand ID supplied
 *         '404':
 *           description: Brand not found
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         offerName:
 *           type: string
 *         offerDescription:
 *           type: string
 *         soldOffers:
 *           type: integer
 *         offerThumbnail:
 *           type: string
 *         offerAvailabilityStartDate:
 *           type: string
 *           format: date-time
 *         offerAvailabilityEndDate:
 *           type: string
 *           format: date-time
 *         serviceStartDate:
 *           type: string
 *           format: date-time
 *         serviceEndDate:
 *           type: string
 *           format: date-time
 *         offerLiveTillSoldOut:
 *           type: boolean
 *         totalOffersAvailable:
 *           type: integer
 */

router.get("/listed/user/brand/:id", getAllListedOffersByBrand);

export default router;
