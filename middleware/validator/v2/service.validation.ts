// Objective of the code: The objective of this code is to validate the fields of the service tool before adding it to the database.
// Author : sanjiv kumar pandit

import { body } from "express-validator";

export const addServiceValidation = [
  body("service").isString().notEmpty(),
  body("oCharges").isNumeric().notEmpty(),
  // body("brandLogo").isString().notEmpty(),
  body("description").isString().notEmpty(),
  body("status").isNumeric().notEmpty(),
];
