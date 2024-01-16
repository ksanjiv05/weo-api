/**
 * this is version 1 router
 * @author sanjiv
 */

import express from "express";
import {
  deleteUserProfile,
  getUserProfile,
  register,
  updateUser,
} from "../../controllers/authController/auth";
import { auth } from "../../middelware/auth";

import {
  getAiGeneratedChatResponse,
  getAiGeneratedImg,
} from "../../controllers/aiController/ai";
import { getCategories } from "../../controllers/categoryController/category";
import { addOffer, updateOffer } from "../../controllers/offerController/offer";
import { upload } from "../../middelware/upload";
import {
  offerDataValidateCheckPointA,
  offerDataValidateCheckPointB,
  offerDataValidateCheckPointC,
  offerDataValidateCheckPointD,
  offerDataValidateCheckPointE,
  offerDataValidateCheckPointF,
} from "../../middelware/validator/offerValidtor";
import {
  brandDataValidateCheckPointA,
  brandDataValidateCheckPointB,
  brandDataValidateCheckPointC,
  brandDataValidateCheckPointD,
} from "../../middelware/validator/brandValidator";
import { addBrand, updateBrand } from "../../controllers/brandController/brand";
import {
  uploadStaticFile,
  uploadStaticFiles,
} from "../../controllers/staticController/static";
import {
  userDataValidateCheckPointA,
  userDataValidateCheckPointB,
} from "../../middelware/validator/userValidator";
import {
  createOfferOrder,
  createSellerAccount,
} from "../../controllers/paymentController/razorpay";
import { addressDataValidate } from "../../middelware/validator/address";
import { addAddress } from "../../controllers/addressController/address";
const router = express.Router();

//user profile routes
router.post("/user", userDataValidateCheckPointA, register);
router.put("/user", auth, userDataValidateCheckPointB, updateUser);
router.get("/user", auth, getUserProfile);
router.delete("/user", auth, deleteUserProfile);

//static no need to we use aws s3
// router.post("/static", upload.single("file"), uploadStaticFile);
// router.post("/static/bulk", upload.array("files"), uploadStaticFiles);

router.post("/avatars", getAiGeneratedImg);
router.post("/weo/chat", getAiGeneratedChatResponse);

//category routes
router.get("/category/all", getCategories);

//offer routes
//path/checkpoint
router.post("/offer/1", auth, offerDataValidateCheckPointA, addOffer);
router.put("/offer/2", auth, offerDataValidateCheckPointB, updateOffer);
router.put("/offer/3", auth, offerDataValidateCheckPointC, updateOffer);
router.put("/offer/4", auth, offerDataValidateCheckPointD, updateOffer);
router.put("/offer/5", auth, offerDataValidateCheckPointE, updateOffer);
router.put("/offer/6", auth, offerDataValidateCheckPointF, updateOffer);

//brand routes
router.post("/brand/1", auth, brandDataValidateCheckPointA, addBrand);
router.put("/brand/2", auth, brandDataValidateCheckPointB, updateBrand);
router.put("/brand/3", auth, brandDataValidateCheckPointC, updateBrand);
router.put("/brand/4", auth, brandDataValidateCheckPointD, updateBrand);

router.post("/address", auth, addressDataValidate, addAddress);

//payment routes

router.post("/offer/payment/order", createOfferOrder);
router.post("/user/account", createSellerAccount);

//webhook routes
router.post("/webhook/payment", async (req, res) => {});
router.post("/webhook/transfer", async (req, res) => {});

export default router;
