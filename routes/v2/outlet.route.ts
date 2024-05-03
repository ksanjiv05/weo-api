// Objectives: Define the routes for the outlet module
// Author: Sanjiv Kumar Pandit

// Import necessary modules
import express from "express";
import { addOutlet } from "../../controllers/v2/outletController/outlet";
import { auth } from "../../middleware/auth";
import { addOutletValidation } from "../../middleware/validator/v2/outlet.validation";

const router = express.Router();

/**
 * @swagger
 * /v2/outlet:
 *   post:
 *     summary: Add an outlet
 *     tags: [Outlet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               outletName:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   pinCode:
 *                     type: string
 *                   location:
 *                     type: array
 *                     items:
 *                       type: number
 *                       minItems: 2
 *                       maxItems: 2
 *                       example: 37.863,38.9754
 *                       required: true
 *                       description: Coordinates are required like [lat,lng]
 *               operatingDays:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                     startTiming:
 *                       type: string
 *                     endTiming:
 *                       type: string
 *               serviceTools:
 *                 type: array
 *                 items:
 *                   type: string
 *               serviceContacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: object
 *                       properties:
 *                         emailId:
 *                           type: string
 *                         visibility:
 *                           type: boolean
 *                     phone:
 *                       type: object
 *                       properties:
 *                         number:
 *                           type: string
 *                         visibility:
 *                           type: boolean
 *     responses:
 *       201:
 *         description: Outlet added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Outlet added successfully
 *       400:
 *         description: Fields are required
 *         content:
 *           application/json:
 *             example:
 *               message: Fields are required
 *       500:
 *         description: Outlet not saved
 *         content:
 *           application/json:
 *             example:
 *               message: Outlet not saved
 */

//Define swagger documentation for the outlet

router.post("/brand/outlet", addOutletValidation, addOutlet);

export default router;
