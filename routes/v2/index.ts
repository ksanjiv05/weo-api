/**
 * this is version 1 router
 * @author sanjiv
 */

import express from "express";

const routerV2 = express.Router();

import categoryRoute from "./category";

//category routes
routerV2.use(categoryRoute);

routerV2.all("*", (req, res) => {
  res.status(404).json({
    message: "invalid route",
  });
});

export default routerV2;
