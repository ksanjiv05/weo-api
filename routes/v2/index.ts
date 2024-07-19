/**
 * this is version 1 router
 * @author sanjiv
 */

import express from "express";

const routerV2 = express.Router();

import categoryRoute from "./category.route";
import stripeRoute from "./stripe.route";
import quantityRoute from "./quantity.route";
import brandRoute from "./brand.route";
import outletRoute from "./outlet.route";
import serviceRoute from "./service.tool.route";
import userRoute from "./user.route";
import offerRoute from "./offer.route";
import listedRoute from "./listed.route";
import transactionRoute from "./transaction.route";
import {
  getAiGeneratedChatResponse,
  getAiGeneratedImg,
  getAiGeneratedLogo,
} from "../../controllers/v1/aiController/ai";
import { auth } from "../../middleware/auth";
//category routes

routerV2.use(userRoute);
routerV2.use(categoryRoute);
routerV2.use(stripeRoute);
routerV2.use(quantityRoute);
routerV2.use(brandRoute);
routerV2.use(outletRoute);
routerV2.use(serviceRoute);
routerV2.use(offerRoute);
routerV2.use(listedRoute);
routerV2.use(transactionRoute);

routerV2.post("/ai/logo", auth, getAiGeneratedLogo);
routerV2.post("/ai/images", auth, getAiGeneratedImg);
routerV2.post("/ai/weo/chat", auth, getAiGeneratedChatResponse);

routerV2.all("*", (req, res) => {
  res.status(404).json({
    message: "invalid route",
  });
});

export default routerV2;
