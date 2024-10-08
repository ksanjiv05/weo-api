//Objective : This file is responsible for handling the routes for the offer module.
//Author : Sanjiv kumar pandit

import express from "express";
import {
  addOffer,
  getOfferById,
  updateOffer,
  deleteOffer,
  addOfferDataPoints,
  updateOfferData,
  toListOffer,
  getOffers,
  deleteOffers,
  getOffersByLocation,
  getOfferByOutletId,
  searchOffers,
} from "../../controllers/v2/offerController/offer";
import { auth } from "../../middleware/auth";
import {
  offerValidationCh1,
  offerValidationCh2,
  offerValidationCh3,
  offerValidationCh4,
  offerValidationCh5,
  offerValidationCh6,
  offerValidationCh7,
  offerValidationCh8,
  validateOffer,
} from "../../middleware/validator/v2/offer.validation";

const router = express.Router();

/**
 * @swagger
 * /v2/offers:
 *   post:
 *     summary: Add a offer
 *     tags: [Offer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkpoint:
 *                 type: number
 *               brand:
 *                 type: string
 *               outlets:
 *                 type: array
 *               subCategories:
 *                 type: array
 *               offerName:
 *                 type: string
 *               offerDescription:
 *                 type: string
 *               boost:
 *                 type: array
 *               offerStatus:
 *                 type: number
 *     responses:
 *       201:
 *         description: Offer added successfully
 *       400:
 *         description: fields are required
 *       500:
 *         description: Offer not saved
 */

router.post("/offers", auth, offerValidationCh1, addOffer);
router.get("/offers", auth, getOffers);
router.get("/offers/location", auth, getOffersByLocation);
router.get("/offers/outlets/:id", auth, getOfferByOutletId);

/**
 * @swagger
 * /v2/offers/{id}:
 *   get:
 *     summary: Get a offer by ID
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the offer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkpoint:
 *                   type: number
 *                 brand:
 *                   type: string
 *                 outlets:
 *                   type: array
 *                 subCategories:
 *                   type: array
 *                 offerName:
 *                   type: string
 *                 offerDescription:
 *                   type: string
 *                 boost:
 *                   type: array
 *                 offerStatus:
 *                   type: number
 *       404:
 *         description: Offer not found
 */

router.get("/offers/:id", auth, getOfferById);

/**
 * @swagger
 * /v2/offers/{id}:
 *   put:
 *     summary: Update a offer by ID
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the offer
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkpoint:
 *                 type: number
 *               brand:
 *                 type: string
 *               outlets:
 *                 type: array
 *               subCategories:
 *                 type: array
 *               offerName:
 *                 type: string
 *               offerDescription:
 *                 type: string
 *               offerStatus:
 *                 type: number
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       400:
 *         description: fields are required
 *       404:
 *         description: Offer not found
 */

router.put("/offers/:id", auth, offerValidationCh1, updateOffer);

/**
 * @swagger
 * /offers/data/{checkpoint-2}:
 *   post:
 *     summary: Update offer - Checkpoint 2
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *         name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offerPriceAmount:
 *                 type: number
 *                 description: The offer price amount
 *               offerPriceMinPercentage:
 *                 type: number
 *                 description: The minimum offer price percentage
 *               paymentType:
 *                 type: string
 *                 description: The payment type
 *               installmentDuration:
 *                 type: number
 *                 description: The installment duration
 *               installmentPeriod:
 *                 type: string
 *                 description: The installment period
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /offers/data/{id}/{checkpoint-2}:
 *   put:
 *     summary: Update offer - Checkpoint 2
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *       - name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer data id
 *       - name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offerPriceAmount:
 *                 type: number
 *                 description: The offer price amount
 *               offerPriceMinPercentage:
 *                 type: number
 *                 description: The minimum offer price percentage
 *               paymentType:
 *                 type: string
 *                 description: The payment type
 *               installmentDuration:
 *                 type: number
 *                 description: The installment duration
 *               installmentPeriod:
 *                 type: string
 *                 description: The installment period
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /offers/data/{id}/{checkpoint-3}:
 *   put:
 *     summary: Update offer - Checkpoint 3
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *       - name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer data id
 *       - name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalOfferUnitItem:
 *                 type: number
 *                 description: The total offer unit item
 *               offerUnitType:
 *                 type: string
 *                 description: The offer unit type
 *               serviceStartTime:
 *                 type: string
 *                 description: The offer service start time should be 24 formate
 *               serviceEndTime:
 *                 type: string
 *                 description: The offer service end time should be 24 formate
 *               minimumOfferUnitItem:
 *                 type: number
 *                 description: The minimum offer unit item
 *               serviceStartDate:
 *                 type: string
 *                 format: date-time
 *                 description: The service start date
 *               serviceEndDate:
 *                 type: string
 *                 format: date-time
 *                 description: The service end date
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /offers/data/{id}/{checkpoint-4}:
 *   put:
 *     summary: Update offer - Checkpoint 4
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *       - name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer data id
 *       - name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offerLiveTillSoldOut:
 *                 type: boolean
 *                 description: If the offer is live till sold out
 *               offerAvailabilityStartDate:
 *                 type: string
 *                 format: date-time
 *                 description: The offer availability start date
 *               offerAvailabilityEndDate:
 *                 type: string
 *                 format: date-time
 *                 description: The offer availability end date
 *               offerAvailableAllTime:
 *                 type: boolean
 *                 description: If the offer is available all the time
 *               offerAvailableDays:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     days:
 *                       type: number
 *                       description: The day of the week
 *                     startTime:
 *                       type: string
 *                       description: time of the day
 *                     endTime:
 *                       type: string
 *                       description: time of the day
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /offers/data/{id}/{checkpoint-5}:
 *   put:
 *     summary: Update offer - Checkpoint 5
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *       - name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer data id
 *       - name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalOffersAvailable:
 *                 type: number
 *                 description: The total offers available
 *               offerReSellable:
 *                 type: boolean
 *                 description: If the offer is resellable
 *               offerLimitPerCustomer:
 *                 type: number
 *                 description: The limit per customer
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /offers/data/{id}/{checkpoint-6}:
 *   put:
 *     summary: Update offer - Checkpoint 6
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *       - name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer data id
 *       - name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ORewardDeductPercentagePerSale:
 *                 type: number
 *                 description: The reward deduct percentage per sale
 *               ORewardDeductPercentageLatePayment:
 *                 type: number
 *                 description: The reward deduct percentage for late payment
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /offers/data/{id}/{checkpoint-7}:
 *   put:
 *     summary: Update offer - Checkpoint 7
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *       - name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer data id
 *       - name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OfferMedia:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The offer media
 *                 minItems: 1
 *                 maxItems: 5
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /offers/data/{id}/{checkpoint-8}:
 *   put:
 *     summary: Update offer - Checkpoint 8
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *       - name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer data id
 *       - name: checkpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkpoint number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offerThumbnail:
 *                 type: string
 *                 description: The offer cover image
 *     responses:
 *       '200':
 *         description: Offer updated successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

router.post(
  "/offers/data/:checkpoint",
  auth,
  offerValidationCh2,
  addOfferDataPoints
);

router.put("/offers/data/:id/2", auth, offerValidationCh2, updateOfferData);
router.put("/offers/data/:id/3", auth, offerValidationCh3, updateOfferData);
router.put("/offers/data/:id/4", auth, offerValidationCh4, updateOfferData);
router.put("/offers/data/:id/5", auth, offerValidationCh5, updateOfferData);
router.put("/offers/data/:id/6", auth, offerValidationCh6, updateOfferData);
router.put("/offers/data/:id/7", auth, offerValidationCh7, updateOfferData);
router.put("/offers/data/:id/8", auth, offerValidationCh8, updateOfferData);
router.put("/offers/listed/:id", auth, toListOffer);

router.delete("/offers", auth, deleteOffers);
router.get("/offers/brands/search", searchOffers);

// router.put("/offers/data/:id/7", auth, validateOffer, updateOffer);

export default router;
