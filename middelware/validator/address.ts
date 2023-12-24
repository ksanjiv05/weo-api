import { body } from "express-validator";

export const addressDataValidate = [
  body("uid").isString().notEmpty().withMessage("uid is required"),
  body("city").isString().notEmpty().withMessage("city is required"),
  body("state").isString().notEmpty().withMessage("state is required"),
  body("pincode").isString().notEmpty().withMessage("pincode is required"),
  body("country").isString().notEmpty().withMessage("country is required"),
  body("address").isString().notEmpty().withMessage("address is required"),
  body("landmark").isString().notEmpty().withMessage("landmark is required"),
  body("coordinates")
    .isObject()
    .notEmpty()
    .withMessage("coordinates is required"),
];
