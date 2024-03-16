import express from "express";

import {
  userDataValidateCheckPointA,
  userDataValidateCheckPointB,
  userDataValidateCheckPointForCreatorName,
} from "../../middleware/validator/userValidator";
import { auth } from "../../middleware/auth";
import {
  deleteUserProfile,
  getUserProfile,
  isExistingUser,
  isUserNameAvailable,
  register,
  updateCreatorName,
  updateUser,
} from "../../controllers/v1/authController/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Social Media Links:
 *       type: object
 *       properties:
 *         instagramURL:
 *           type: string
 *         facebookURL:
 *           type: string
 *         xURL:
 *           type: string
 *       required:
 *         - instagramURL
 *         - facebookURL
 *         - xURL
 *
 *     KYC Document:
 *       type: object
 *       properties:
 *         panCardImage:
 *           type: string
 *         govtIdFrontImage:
 *           type: string
 *         govtIdBackImage:
 *           type: string
 *         passportImage:
 *           type: string
 *         drivingLicenseImage:
 *           type: string
 *       required:
 *         - panCardImage
 *         - govtIdFrontImage
 *         - govtIdBackImage
 *         - passportImage
 *         - drivingLicenseImage
 *
 *     Bank Account:
 *       type: object
 *       properties:
 *         accounId:
 *           type: string
 *         isPrimary:
 *           type: boolean
 *         accountHolderName:
 *           type: string
 *       required:
 *         - accounId
 *         - isPrimary
 *         - accountHolderName
 *
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         profileImage:
 *           type: string
 *         phone:
 *           type: string
 *         coverImg:
 *           type: string
 *         email:
 *           type: string
 *         recoveryCode:
 *           type: string
 *         fcmToken:
 *           type: string
 *         successRate:
 *           type: number
 *         earned:
 *           type: number
 *         socialMedia:
 *           $ref: '#/components/schemas/Social Media Links'
 *         kyc:
 *           $ref: '#/components/schemas/KYC Document'
 *         addresses:
 *           type: array
 *           items:
 *             type: string
 *         devices:
 *           type: array
 *           items:
 *             type: string
 *         wishLists:
 *           type: array
 *           items:
 *             type: string
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         bankAccounts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Bank Account'
 *         createdAt:
 *           type: number
 *         updateAt:
 *           type: number
 *       required:
 *         - uid
 *         - name
 *         - phone
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User operations
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             uid: "user3"
 *             name: "Jane Doe"
 *             description: "New user description"
 *             profileImage: "profile3.jpg"
 *             phone: "9876543210"
 *             coverImg: "cover3.jpg"
 *             email: "jane@example.com"
 *             recoveryCode: "recovery456"
 *             fcmToken: "fcmToken456"
 *             successRate: 90
 *             earned: 800
 *             socialMedia:
 *               instagramURL: "https://www.instagram.com/janedoe/"
 *               facebookURL: "https://www.facebook.com/janedoe/"
 *             kyc:
 *               panCardImage: "pan3.jpg"
 *               govtIdFrontImage: "govtFront3.jpg"
 *               govtIdBackImage: "govtBack3.jpg"
 *             addresses:
 *               - "Address 3"
 *               - "Address 4"
 *             devices:
 *               - "Device 3"
 *               - "Device 4"
 *             wishLists:
 *               - "Product 3"
 *               - "Product 4"
 *             likes:
 *               - "Brand 3"
 *               - "Brand 4"
 *             bankAccounts:
 *               - accounId: "account3"
 *                 isPrimary: true
 *                 accountHolderName: "Jane Doe"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               uid: "user3"
 *               name: "Jane Doe"
 *               description: "New user description"
 *               profileImage: "profile3.jpg"
 *               phone: "9876543210"
 *               coverImg: "cover3.jpg"
 *               email: "jane@example.com"
 *               recoveryCode: "recovery456"
 *               fcmToken: "fcmToken456"
 *               successRate: 90
 *               earned: 800
 *               socialMedia:
 *                 instagramURL: "https://www.instagram.com/janedoe/"
 *                 facebookURL: "https://www.facebook.com/janedoe/"
 *               kyc:
 *                 panCardImage: "pan3.jpg"
 *                 govtIdFrontImage: "govtFront3.jpg"
 *                 govtIdBackImage: "govtBack3.jpg"
 *               addresses:
 *                 - "Address 3"
 *                 - "Address 4"
 *               devices:
 *                 - "Device 3"
 *                 - "Device 4"
 *               wishLists:
 *                 - "Product 3"
 *                 - "Product 4"
 *               likes:
 *                 - "Brand 3"
 *                 - "Brand 4"
 *               bankAccounts:
 *                 - accounId: "account3"
 *                   isPrimary: true
 *                   accountHolderName: "Jane Doe"
 *               createdAt: 1645021200
 *               updateAt: 1645021200
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/{uid}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Updated Jane Doe"
 *             description: "Updated user description"
 *             profileImage: "updatedProfile3.jpg"
 *             phone: "9876543210"
 *             coverImg: "updatedCover3.jpg"
 *             email: "jane@example.com"
 *             recoveryCode: "updatedRecovery456"
 *             fcmToken: "updatedFcmToken456"
 *             successRate: 92
 *             earned: 850
 *             socialMedia:
 *               instagramURL: "https://www.instagram.com/updatedjanedoe/"
 *               facebookURL: "https://www.facebook.com/updatedjanedoe/"
 *             kyc:
 *               panCardImage: "updatedPan3.jpg"
 *               govtIdFrontImage: "updatedGovtFront3.jpg"
 *               govtIdBackImage: "updatedGovtBack3.jpg"
 *             addresses:
 *               - "Updated Address 3"
 *               - "Updated Address 4"
 *             devices:
 *               - "Updated Device 3"
 *               - "Updated Device 4"
 *             wishLists:
 *               - "Updated Product 3"
 *               - "Updated Product 4"
 *             likes:
 *               - "Updated Brand 3"
 *               - "Updated Brand 4"
 *             bankAccounts:
 *               - accounId: "updatedAccount3"
 *                 isPrimary: true
 *                 accountHolderName: "Updated Jane Doe"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               uid: "user3"
 *               name: "Updated Jane Doe"
 *               description: "Updated user description"
 *               profileImage: "updatedProfile3.jpg"
 *               phone: "9876543210"
 *               coverImg: "updatedCover3.jpg"
 *               email: "jane@example.com"
 *               recoveryCode: "updatedRecovery456"
 *               fcmToken: "updatedFcmToken456"
 *               successRate: 92
 *               earned: 850
 *               socialMedia:
 *                 instagramURL: "https://www.instagram.com/updatedjanedoe/"
 *                 facebookURL: "https://www.facebook.com/updatedjanedoe/"
 *               kyc:
 *                 panCardImage: "updatedPan3.jpg"
 *                 govtIdFrontImage: "updatedGovtFront3.jpg"
 *                 govtIdBackImage: "updatedGovtBack3.jpg"
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               users:
 *                 - uid: "user1"
 *                   name: "John Doe"
 *                   description: "User description"
 *                   profileImage: "profile1.jpg"
 *                   phone: "1234567890"
 *                   coverImg: "cover1.jpg"
 *                   email: "john@example.com"
 *                   recoveryCode: "recovery123"
 *                   fcmToken: "fcmToken123"
 *                   successRate: 95
 *                   earned: 1000
 *                   socialMedia:
 *                     instagramURL: "https://www.instagram.com/johndoe/"
 *                     facebookURL: "https://www.facebook.com/johndoe/"
 *                   kyc:
 *                     panCardImage: "pan1.jpg"
 *                     govtIdFrontImage: "govtFront1.jpg"
 *                     govtIdBackImage: "govtBack1.jpg"
 *                   addresses:
 *                     - "Address 1"
 *                     - "Address 2"
 *                   devices:
 *                     - "Device 1"
 *                     - "Device 2"
 *                   wishLists:
 *                     - "Product 1"
 *                     - "Product 2"
 *                   likes:
 *                     - "Brand 1"
 *                     - "Brand 2"
 *                   bankAccounts:
 *                     - accounId: "account1"
 *                       isPrimary: true
 *                       accountHolderName: "John Doe"
 *                   createdAt: 1644927600
 *                   updateAt: 1644927600
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/{uid}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               uid: "user1"
 *               name: "John Doe"
 *               description: "User description"
 *               profileImage: "profile1.jpg"
 *               phone: "1234567890"
 *               coverImg: "cover1.jpg"
 *               email: "john@example.com"
 *               recoveryCode: "recovery123"
 *               fcmToken: "fcmToken123"
 *               successRate: 95
 *               earned: 1000
 *               socialMedia:
 *                 instagramURL: "https://www.instagram.com/johndoe/"
 *                 facebookURL: "https://www.facebook.com/johndoe/"
 *               kyc:
 *                 panCardImage: "pan1.jpg"
 *                 govtIdFrontImage: "govtFront1.jpg"
 *                 govtIdBackImage: "govtBack1.jpg"
 *               addresses:
 *                 - "Address 1"
 *                 - "Address 2"
 *               devices:
 *                 - "Device 1"
 *                 - "Device 2"
 *               wishLists:
 *                 - "Product 1"
 *                 - "Product 2"
 *               likes:
 *                 - "Brand 1"
 *                 - "Brand 2"
 *               bankAccounts:
 *                 - accounId: "account1"
 *                   isPrimary: true
 *                   accountHolderName: "John Doe"
 *               createdAt: 1644927600
 *               updateAt: 1644927600
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */

router.post("/users", auth, userDataValidateCheckPointA, register);
router.get("/users/exist", isExistingUser);
router.get("/users/exist/:creatorName", auth, isUserNameAvailable);
router.put(
  "/users/creatorName",
  auth,
  userDataValidateCheckPointForCreatorName,
  updateCreatorName
);
router.put("/users/:id", auth, userDataValidateCheckPointB, updateUser);
router.get("/users", auth, getUserProfile);
router.delete("/users/:id", auth, deleteUserProfile);

export default router;
