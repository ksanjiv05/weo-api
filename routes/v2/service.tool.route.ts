// Objective : Define the Service Tool functions that will be used in the routes
// Author : Sanjiv Kumar Pandit

// Import necessary modules
import express from "express";
import {
  addServiceTool,
  deleteServiceTool,
  getServiceToolById,
  getServiceTools,
  updateServiceTool,
} from "../../controllers/v2/serviceToolsController/serviceTools";

const router = express.Router();

// Define the routes

// Route to add the service tool

/**
 * @swagger
 * /v2/services:
 *   post:
 *     summary: Add a services
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service:
 *                 type: string
 *               oCharges:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: services added successfully
 *       400:
 *         description: fields are required
 *       500:
 *         description: service not saved
 */
router.post("/services", addServiceTool);

// Route to update the service tool
/**
 * @swagger
 * /v2/services/{id}:
 *   put:
 *     summary: Update a service tool
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Service id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service:
 *                 type: string
 *               oCharges:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       500:
 *         description: Service not saved
 */

router.put("/services/:id", updateServiceTool);

// Route to get the service tools
/**
 * @swagger
 * /v2/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Get all services
 *       500:
 *         description: Brand not found
 */
router.get("/services", getServiceTools);

// Route to get the service tool by id
/**
 * @swagger
 * /v2/services/{id}:
 *   get:
 *     summary: Get a service tool by id
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Service id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get a service tool by id
 *       500:
 *         description: Service not found
 */
router.get("/services/:id", getServiceToolById);

// Route to delete the service tool
/**
 * @swagger
 * /v2/services/{id}:
 *   delete:
 *     summary: Delete a service tool
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Service id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       500:
 *         description: Service not deleted
 */
router.delete("/services/:id", deleteServiceTool);

export default router;
