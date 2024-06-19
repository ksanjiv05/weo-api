/**
 * this is version 1 router
 * @author sanjiv
 */

import express from "express";
import { auth } from "../../middleware/auth";

import {
  getAiGeneratedChatResponse,
  getAiGeneratedImg,
  getAiGeneratedLogo,
} from "../../controllers/v1/aiController/ai";

import {
  createOfferOrder,
  createSellerAccount,
} from "../../controllers/v1/paymentController/razorpay";
import { addressDataValidate } from "../../middleware/validator/address";
import { addAddress } from "../../controllers/v1/addressController/address";
const router = express.Router();

import userRoute from "./user";
import brandRoute from "./brand";
import offerRoute from "./offer";
import categoryRoute from "./category";
import constantRoute from "./constant";
import collectRoute from "./collector";
import { exportCsv } from "../../helper/csvUtils";
//user profile routes
router.use(userRoute);

//brand routes
router.use(brandRoute);

//offer routes
router.use(offerRoute);

//category routes
router.use(categoryRoute);

//constant routes
router.use(constantRoute);

//collector routes
router.use(collectRoute);

//static no need to we use aws s3
// router.post("/static", upload.single("file"), uploadStaticFile);
// router.post("/static/bulk", upload.array("files"), uploadStaticFiles);

router.post("/ai/logo", getAiGeneratedLogo);
router.post("/ai/images", getAiGeneratedImg);
router.post("/ai/weo/chat", getAiGeneratedChatResponse);

//offer routes

router.post("/address", auth, addressDataValidate, addAddress);

//payment routes

router.post("/offer/payment/order", createOfferOrder);
router.post("/user/account", createSellerAccount);

//webhook routes
router.post("/webhook/payment", async (req, res) => {});
router.post("/webhook/transfer", async (req, res) => {});

router.get("/test", (req, res) => {
  exportCsv({}, "test", res);
});

router.all("*", (req, res) => {
  res.status(404).json({
    message: "invalid route",
  });
});

export default router;
