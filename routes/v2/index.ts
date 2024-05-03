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

//category routes
routerV2.use(categoryRoute);
routerV2.use(stripeRoute);
routerV2.use(quantityRoute);
routerV2.use(brandRoute);
routerV2.use(outletRoute);

routerV2.all("*", (req, res) => {
  res.status(404).json({
    message: "invalid route",
  });
});

export default routerV2;
