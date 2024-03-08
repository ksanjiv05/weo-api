import { body } from "express-validator";

export const collectorDataValidate = [
  body("offer").isString().notEmpty().withMessage("offerId is required"),
  body("paymentType")
    .isString()
    .notEmpty()
    .withMessage("payment type is required"),
  body("amount").isNumeric().notEmpty().withMessage("amount is required"),
];
