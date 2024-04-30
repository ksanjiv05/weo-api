/**
 * this is version 1 router
 * @author sanjiv
 */

import express from "express";

const routerV2 = express.Router();

import categoryRoute from "./category";
import stripeRoute from "./stripe";
import quantityRoute from "./quantity";

//category routes
routerV2.use(categoryRoute);
routerV2.use(stripeRoute);
routerV2.use(quantityRoute);

routerV2.all("*", (req, res) => {
  res.status(404).json({
    message: "invalid route",
  });
});

export default routerV2;
