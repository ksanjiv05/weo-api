import express from "express";
import {
  addOffer,
  getOffers,
  isOfferNameExist,
  updateOffer,
} from "../../controllers/offerController/offer";
import {
  offerDataValidateCheckPointA,
  offerDataValidateCheckPointB,
  offerDataValidateCheckPointC,
  offerDataValidateCheckPointD,
  offerDataValidateCheckPointE,
  offerDataValidateCheckPointF,
} from "../../middelware/validator/offerValidtor";
import { auth } from "../../middelware/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         checkpoint:
 *           type: number
 *         creatorId:
 *           type: string
 *         brandId:
 *           type: string
 *         brandName:
 *           type: string
 *         productIds:
 *           type: array
 *           items:
 *             type: string
 *         offerTitle:
 *           type: string
 *         offerDescription:
 *           type: string
 *         offerMedia:
 *           type: array
 *           items:
 *             type: string
 *         offerPriceType:
 *           type: string
 *         offerPriceAmount:
 *           type: number
 *         paymentType:
 *           type: string
 *         installmentTimePeriod:
 *           type: string
 *         installmentDuration:
 *           type: number
 *         minAccessBalance:
 *           type: number
 *         maxOAccess:
 *           type: number
 *         serviceUnitName:
 *           type: string
 *         totalServiceUnitType:
 *           type: string
 *         totalServiceUnitItems:
 *           type: number
 *         durationUnitType:
 *           type: string
 *         durationUnitItems:
 *           type: number
 *         totalOffersAvailable:
 *           type: number
 *         offerLimitPerCustomer:
 *           type: number
 *         offerActivitiesAt:
 *           type: string
 *           enum: [Both, Online Store, Offline]
 *         offerActivationStartTime:
 *           type: number
 *         offerActivationEndTime:
 *           type: number
 *         offerValidityStartDate:
 *           type: number
 *         offerValidityEndDate:
 *           type: number
 *         offerStatus:
 *           type: string
 *           enum: [pending, live, onhold, draft]
 *         offerThumbnailImage:
 *           type: string
 *         cratededAt:
 *           type: number
 *         updateAt:
 *           type: number
 *       required:
 *         - checkpoint
 *         - creatorId
 *         - brandId
 *         - brandName
 *         - productIds
 *         - offerTitle
 *         - offerDescription
 *         - offerMedia
 *         - offerPriceType
 *         - offerPriceAmount
 *         - paymentType
 *         - installmentTimePeriod
 *         - installmentDuration
 *         - minAccessBalance
 *         - maxOAccess
 *         - serviceUnitName
 *         - totalServiceUnitType
 *         - totalServiceUnitItems
 *         - durationUnitType
 *         - durationUnitItems
 *         - totalOffersAvailable
 *         - offerLimitPerCustomer
 *         - offerActivitiesAt
 *         - offerActivationStartTime
 *         - offerActivationEndTime
 *         - offerValidityStartDate
 *         - offerValidityEndDate
 *         - offerStatus
 *         - offerThumbnailImage
 */

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Offer operations
 */

/**
 * @swagger
 * /offers:
 *   post:
 *     summary: Create a new offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             checkpoint: 2
 *             creatorId: "user2"
 *             brandId: "brand2"
 *             brandName: "Brand 2"
 *             productIds: ["product3", "product4"]
 *             offerTitle: "Offer 2"
 *             offerDescription: "Description of Offer 2"
 *             offerMedia: ["media3.jpg", "media4.jpg"]
 *             offerPriceType: "Percentage"
 *             offerPriceAmount: 15.0
 *             paymentType: "PayPal"
 *             installmentTimePeriod: "Weekly"
 *             installmentDuration: 6
 *             minAccessBalance: 30.0
 *             maxOAccess: 80.0
 *             serviceUnitName: "Service"
 *             totalServiceUnitType: "Session"
 *             totalServiceUnitItems: 5
 *             durationUnitType: "Month"
 *             durationUnitItems: 20
 *             totalOffersAvailable: 50
 *             offerLimitPerCustomer: 1
 *             offerActivitiesAt: "Online Store"
 *             offerActivationStartTime: 1645102800
 *             offerActivationEndTime: 1645189200
 *             offerValidityStartDate: 1645275600
 *             offerValidityEndDate: 1645362000
 *             offerStatus: "draft"
 *             offerThumbnailImage: "thumbnail2.jpg"
 *     responses:
 *       201:
 *         description: Offer created successfully
 *         content:
 *           application/json:
 *             example:
 *               checkpoint: 2
 *               creatorId: "user2"
 *               brandId: "brand2"
 *               brandName: "Brand 2"
 *               productIds: ["product3", "product4"]
 *               offerTitle: "Offer 2"
 *               offerDescription: "Description of Offer 2"
 *               offerMedia: ["media3.jpg", "media4.jpg"]
 *               offerPriceType: "Percentage"
 *               offerPriceAmount: 15.0
 *               paymentType: "PayPal"
 *               installmentTimePeriod: "Weekly"
 *               installmentDuration: 6
 *               minAccessBalance: 30.0
 *               maxOAccess: 80.0
 *               serviceUnitName: "Service"
 *               totalServiceUnitType: "Session"
 *               totalServiceUnitItems: 5
 *               durationUnitType: "Month"
 *               durationUnitItems: 20
 *               totalOffersAvailable: 50
 *               offerLimitPerCustomer: 1
 *               offerActivitiesAt: "Online Store"
 *               offerActivationStartTime: 1645102800
 *
 */

/**
 * @swagger
 * /offers:
 *   get:
 *     summary: Get all offers
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               offers:
 *                 - checkpoint: 1
 *                   creatorId: "user1"
 *                   brandId: "brand1"
 *                   brandName: "Brand 1"
 *                   productIds: ["product1", "product2"]
 *                   offerTitle: "Offer 1"
 *                   offerDescription: "Description of Offer 1"
 *                   offerMedia: ["media1.jpg", "media2.jpg"]
 *                   offerPriceType: "Fixed"
 *                   offerPriceAmount: 10.99
 *                   paymentType: "Credit Card"
 *                   installmentTimePeriod: "Monthly"
 *                   installmentDuration: 12
 *                   minAccessBalance: 50.0
 *                   maxOAccess: 100.0
 *                   serviceUnitName: "Unit"
 *                   totalServiceUnitType: "Hour"
 *                   totalServiceUnitItems: 10
 *                   durationUnitType: "Day"
 *                   durationUnitItems: 30
 *                   totalOffersAvailable: 100
 *                   offerLimitPerCustomer: 2
 *                   offerActivitiesAt: "Both"
 *                   offerActivationStartTime: 1644931200
 *                   offerActivationEndTime: 1645017600
 *                   offerValidityStartDate: 1645099200
 *                   offerValidityEndDate: 1645185600
 *                   offerStatus: "live"
 *                   offerThumbnailImage: "thumbnail.jpg"
 *                   createdAt: 1644927600
 *                   updateAt: 1644927600
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /offers/{id}:
 *   get:
 *     summary: Get an offer by checkpoint
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: offer id of the offer
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               checkpoint: 1
 *               creatorId: "user1"
 *               brandId: "brand1"
 *               brandName: "Brand 1"
 *               productIds: ["product1", "product2"]
 *               offerTitle: "Offer 1"
 *               offerDescription: "Description of Offer 1"
 *               offerMedia: ["media1.jpg", "media2.jpg"]
 *               offerPriceType: "Fixed"
 *               offerPriceAmount: 10.99
 *               paymentType: "Credit Card"
 *               installmentTimePeriod: "Monthly"
 *               installmentDuration: 12
 *               minAccessBalance: 50.0
 *               maxOAccess: 100.0
 *               serviceUnitName: "Unit"
 *               totalServiceUnitType: "Hour"
 *               totalServiceUnitItems: 10
 *               durationUnitType: "Day"
 *               durationUnitItems: 30
 *               totalOffersAvailable: 100
 *               offerLimitPerCustomer: 2
 *               offerActivitiesAt: "Both"
 *               offerActivationStartTime: 1644931200
 *               offerActivationEndTime: 1645017600
 *               offerValidityStartDate: 1645099200
 *               offerValidityEndDate: 1645185600
 *               offerStatus: "live"
 *               offerThumbnailImage: "thumbnail.jpg"
 *               createdAt: 1644927600
 *               updateAt: 1644927600
 *       404:
 *         description: Offer not found
 *       401:
 *         description: Unauthorized
 */

router.get("/offers/exist", auth, isOfferNameExist);
router.post("/offers", auth, offerDataValidateCheckPointA, addOffer);
router.put("/offers/2", auth, offerDataValidateCheckPointB, updateOffer);
router.put("/offers/3", auth, offerDataValidateCheckPointC, updateOffer);
router.put("/offers/4", auth, offerDataValidateCheckPointD, updateOffer);
router.put("/offers/5", auth, offerDataValidateCheckPointE, updateOffer);
router.put("/offers/6", auth, offerDataValidateCheckPointF, updateOffer);

router.get("/offers/all", auth, getOffers);
router.get("/offers", auth, getOffers);
router.get("/offers/:id", auth, getOffers);

export default router;
