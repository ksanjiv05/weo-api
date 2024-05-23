// Objective of the code: The objective of this code is to validate the fields of the outlet before adding it to the database.
// Author : sanjiv kumar pandit

import { body } from "express-validator";

// Validation for adding outlets

export const addOutletValidation = [
  body().isArray().notEmpty(),
  body("*.brand").isString().notEmpty().withMessage("Brand is required"),
  body("*.outletName")
    .isString()
    .notEmpty()
    .withMessage("Outlet name is required"),
  body("*.address.address")
    .isString()
    .notEmpty()
    .withMessage("Address is required"),
  body("*.address.country")
    .isString()
    .notEmpty()
    .withMessage("Country is required"),
  body("*.address.state")
    .isString()
    .notEmpty()
    .withMessage("State is required"),
  body("*.address.pinCode")
    .isString()
    .notEmpty()
    .withMessage("PinCode is required"),
  body("*.address.location.coordinates")
    .isArray({ min: 2, max: 2 })
    .notEmpty()
    .withMessage("Coordinates are required like [lat,lng]"),

  body("*.operatingDays").isArray().notEmpty(),
  body("*.serviceTools").isArray().notEmpty(),
  body("*.serviceContacts").isArray().notEmpty(),
  body("*.serviceContacts.*.email.emailId")
    .isEmail()
    .withMessage("Email is required in service contacts"),
  body("*.serviceContacts.*.phone.number")
    .isMobilePhone("any")
    .withMessage("Phone number is required in service contacts"),
];
