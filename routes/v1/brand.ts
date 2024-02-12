import express from "express";

import { auth } from "../../middelware/auth";
import {
  addBrand,
  deleteBrand,
  getBrand,
  getBrands,
  getBrandsByUid,
  isBrandNameExist,
  updateBrand,
} from "../../controllers/brandController/brand";
import {
  brandDataValidateCheckPoint,
  brandDataValidateCheckPointA,
  brandDataValidateCheckPointB,
  brandDataValidateCheckPointC,
  brandDataValidateCheckPointD,
} from "../../middelware/validator/brandValidator";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Location Props:
 *       type: object
 *       properties:
 *         location:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *       required:
 *         - location
 *         - latitude
 *         - longitude
 *
 *     Offline Location Props:
 *       type: object
 *       properties:
 *         location:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         address:
 *           type: string
 *         postcode:
 *           type: string
 *         landmark:
 *           type: string
 *       required:
 *         - location
 *         - latitude
 *         - longitude
 *         - address
 *         - postcode
 *         - landmark
 *
 *     Brand:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *         brandName:
 *           type: string
 *         brandDescription:
 *           type: string
 *         status:
 *           type: string | number
 *         checkpoint:
 *           type: number
 *         categoriesIds:
 *           type: array
 *           items:
 *             type: string
 *         serviceLocationType:
 *           type: string
 *         websiteLink:
 *           type: string
 *         onlineServiceLocationType:
 *           type: string
 *         onlineLocations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LocationProps'
 *         offlineLocations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OfflineLocationProps'
 *         coverImage:
 *           type: string
 *         profileImage:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updateAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - uid
 *         - brandName
 *         - brandDescription
 *         - status
 *         - checkpoint
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 */

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Brand operations
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               brands:
 *                 - uid: "1"
 *                   brandName: "Brand 1"
 *                   brandDescription: "Description of Brand 1"
 *                   status: "Active"
 *                   checkpoint: 10
 *                   categoriesIds: ["category1", "category2"]
 *                   serviceLocationType: "Online"
 *                   websiteLink: "https://example.com"
 *                   onlineServiceLocationType: "Worldwide"
 *                   onlineLocations:
 *                     - location: "Online Location 1"
 *                       latitude: 40.7128
 *                       longitude: -74.0060
 *                     - location: "Online Location 2"
 *                       latitude: 34.0522
 *                       longitude: -118.2437
 *                   offlineLocations:
 *                     - location: "Offline Location 1"
 *                       latitude: 41.8781
 *                       longitude: -87.6298
 *                       address: "123 Main St"
 *                       postcode: "12345"
 *                       landmark: "Landmark 1"
 *                   coverImage: "https://example.com/cover.jpg"
 *                   profileImage: "https://example.com/profile.jpg"
 *                   createdAt: "2022-01-01T12:00:00Z"
 *                   updateAt: "2022-01-02T14:30:00Z"
 */

/**
 * @swagger
 * /brands/{brandId}:
 *   get:
 *     summary: Get a brand by ID
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         description: ID of the brand
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               uid: "1"
 *               brandName: "Brand 1"
 *               brandDescription: "Description of Brand 1"
 *               status: "Active"
 *               checkpoint: 10
 *               categoriesIds: ["category1", "category2"]
 *               serviceLocationType: "Online"
 *               websiteLink: "https://example.com"
 *               onlineServiceLocationType: "Worldwide"
 *               onlineLocations:
 *                 - location: "Online Location 1"
 *                   latitude: 40.7128
 *                   longitude: -74.0060
 *                 - location: "Online Location 2"
 *                   latitude: 34.0522
 *                   longitude: -118.2437
 *               offlineLocations:
 *                 - location: "Offline Location 1"
 *                   latitude: 41.8781
 *                   longitude: -87.6298
 *                   address: "123 Main St"
 *                   postcode: "12345"
 *                   landmark: "Landmark 1"
 *               coverImage: "https://example.com/cover.jpg"
 *               profileImage: "https://example.com/profile.jpg"
 *               createdAt: "2022-01-01T12:00:00Z"
 *               updateAt: "2022-01-02T14:30:00Z"
 *       404:
 *         description: Brand not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             brandName: "New Brand"
 *             brandDescription: "Description of New Brand"
 *             status: "Active"
 *             checkpoint: 5
 *             categoriesIds: ["category3"]
 *             serviceLocationType: "Online"
 *             websiteLink: "https://newbrand.com"
 *             onlineServiceLocationType: "Nationwide"
 *             onlineLocations:
 *               - location: "New Online Location"
 *                 latitude: 37.7749
 *                 longitude: -122.4194
 *             offlineLocations:
 *               - location: "New Offline Location"
 *                 latitude: 40.7128
 *                 longitude: -74.0060
 *                 address: "123 Main St"
 */

/**
 * @swagger
 * /brands/2:
 *   put:
 *     summary: Brand updated
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checkpoint
 *         required: true
 *         description: checkpoint of the brand
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             brandName: "New Brand"
 *             brandDescription: "Description of New Brand"
 *             status: "Active"
 *             checkpoint: 2
 *             categoriesIds: ["ca1"]
 */

/**
 * @swagger
 * /brands/3:
 *   put:
 *     summary: Brand updated
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checkpoint
 *         required: true
 *         description: checkpoint of the brand
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             brandName: "New Brand"
 *             brandDescription: "Description of New Brand"
 *             status: "Active"
 *             checkpoint: 5
 *             categoriesIds: ["ca1"]
 *             serviceLocationType: "Online"
 *             websiteLink: "https://newbrand.com"
 *             onlineServiceLocationType: "Nationwide"
 *             onlineLocations: ""
 *             offlineLocations: ""
 */

/**
 * @swagger
 * /brands/4:
 *   put:
 *     summary: Brand updated
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checkpoint
 *         required: true
 *         description: checkpoint of the brand
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             brandName: "New Brand"
 *             brandDescription: "Description of New Brand"
 *             status: "Active"
 *             checkpoint: 5
 *             categoriesIds: ["ca1"]
 *             serviceLocationType: "Online"
 *             websiteLink: "https://newbrand.com"
 *             onlineServiceLocationType: "Nationwide"
 *             onlineLocations: ""
 *             offlineLocations: ""
 *             coverImage: "https://example.com/cover.jpg"
 *             profileImage: "https://example.com/profile.jpg"
 *
 */

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             brandName: "New Brand"
 *             brandDescription: "Description of New Brand"
 *             status: "Active"
 *             checkpoint: 5
 *             categoriesIds: ["category3"]
 *             serviceLocationType: "Online"
 *             websiteLink: "https://newbrand.com"
 *             onlineServiceLocationType: "Nationwide"
 *             onlineLocations:
 *               - location: "New Online Location"
 *                 latitude: 37.7749
 *                 longitude: -122.4194
 *             offlineLocations:
 *               - location: "New Offline Location"
 *                 latitude: 40.7128
 *                 longitude: -74.0060
 *                 address: "123 Main St"
 */

/**
 * @swagger
 * /brands/{brandId}:
 *   delete:
 *     summary: Delete a brand by ID
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         description: ID of the brand
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 */

// router.get("/brands", auth, getBrands);
router.get("/brands", auth, getBrandsByUid);
router.get("/brands/exist", auth, isBrandNameExist);
router.get("/brands/:brandId", auth, getBrand);

router.post(
  "/brands",
  auth,
  // brandDataValidateCheckPoint,
  // (req, res) => {
  //   console.log("i amm");
  // },
  addBrand
);
router.put("/brands/1", auth, brandDataValidateCheckPointA, addBrand);
router.put("/brands/2", auth, brandDataValidateCheckPointB, updateBrand);
router.put("/brands/3", auth, brandDataValidateCheckPointC, updateBrand);
router.put("/brands/4", auth, brandDataValidateCheckPointD, updateBrand);
router.put("/brands/5", auth, brandDataValidateCheckPointD, updateBrand);

router.delete("/brands/:brandId", auth, deleteBrand);

export default router;
