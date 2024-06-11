// Objectives: Define the routes for the outlet module
// Author: Sanjiv Kumar Pandit

// Import necessary modules
import express from "express";
import {
  addOutlet,
  deleteOutlet,
  getOutletById,
  getOutlets,
  updateOutlet,
} from "../../controllers/v2/outletController/outlet";
import { auth } from "../../middleware/auth";
import { addOutletValidation } from "../../middleware/validator/v2/outlet.validation";

const router = express.Router();

/**
 * @swagger
 * /v2/brand/outlets:
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
 *                   landmark:
 *                     type: string
 *                   location:
 *                     type: object
 *                     properties:
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *                           minItems: 2
 *                           maxItems: 2
 *                           example: 37.863,38.9754
 *                           required: true
 *                           description: Coordinates are required like [lat,lng]
 *               operatingDays:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
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

router.post("/brand/outlets", auth, addOutletValidation, addOutlet);

/**
 * @swagger
 * /v2/brand/outlets/{id}:
 *   put:
 *     summary: Update an outlet
 *     tags: [Outlet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Outlet id
 *         schema:
 *           type: string
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
 *                     type: object
 *                     properties:
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *                           minItems: 2
 *                           maxItems: 2
 *                           example: 37.863,38.9754
 *                           required: true
 *                           description: Coordinates are required like [lat,lng]
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
 *         description: Outlet updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Outlet updated successfully
 *       400:
 *         description: Fields are required
 *         content:
 *           application/json:
 *             example:
 *
 *              message: Fields are required
 *       500:
 *         description: Outlet not saved
 *         content:
 *           application/json:
 *             example:
 *               message: Outlet not saved
 */

router.put("/brand/outlets/:id", auth, addOutletValidation, updateOutlet);

/**
 * @swagger
 * /v2/brand/outlets:
 *   get:
 *     summary: Get all outlets
 *     tags: [Outlet]
 *     responses:
 *       200:
 *         description: Get all outlets
 *         content:
 *           application/json:
 *             example:
 *               message: Get all outlets
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
router.get("/brand/outlets", auth, getOutlets);

/**
 * @swagger
 * /v2/brand/outlets/{id}:
 *   get:
 *     summary: Get an outlet by id
 *     tags: [Outlet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Outlet id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get an outlet by id
 *       500:
 *         description: Outlet not found
 */
router.get("/brand/outlets/:id", auth, getOutletById);

/**
 * @swagger
 * /v2/brand/outlets/{id}:
 *   delete:
 *     summary: Delete an outlet by id
 *     tags: [Outlet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Outlet id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Outlet deleted successfully
 *       500:
 *         description: Internal server error
 */

router.delete("/brand/outlets/:id", auth, deleteOutlet);

export default router;
