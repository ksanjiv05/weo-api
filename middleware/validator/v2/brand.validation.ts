// Objective of the code: The objective of this code is to validate the fields of the brand before adding it to the database.
// Author : sanjiv kumar pandit

import { body } from "express-validator";

export const addBrandValidation = [
  body("brandName").isString().notEmpty(),
  body("brandDescription").isString().notEmpty(),
  body("brandLogo").isString().notEmpty(),
  body("categoryId").isString().notEmpty(),
  body("status").isNumeric().notEmpty(),
  body("checkpoint").isNumeric().notEmpty(),
];
