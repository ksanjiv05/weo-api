// Objective : This file is responsible for handling the routes for the listed module.
//Author : Sanjiv kumar pandit

import express from "express";
import { auth } from "../../middleware/auth";
import { createListed } from "../../controllers/v2/listedController/listed";

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

export default router;
