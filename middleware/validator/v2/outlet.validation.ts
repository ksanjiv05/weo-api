// Objective of the code: The objective of this code is to validate the fields of the outlet before adding it to the database.
// Author : sanjiv kumar pandit

import { body } from "express-validator";

// Validation for adding outlets

export const addOutletValidation = [
  body("*.brand").isString().withMessage("Brand must be a valid MongoID"),
  body("*.outletName").isString().withMessage("Outlet name must be a string"),
  body("*.operatingDays.*.day")
    .isIn(["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"])
    .withMessage("Invalid day of the week"),
  body("*.operatingDays.*.startTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9] [AP]M$/)
    .withMessage("Start time must be in the format HH:MM AM/PM"),
  body("*.operatingDays.*.endTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9] [AP]M$/)
    .withMessage("End time must be in the format HH:MM AM/PM"),
  body("*.serviceTools.*")
    .isString()
    .withMessage("Each service tool must be a valid MongoID"),
  body("*.serviceContacts.phone.number")
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  body("*.serviceContacts.email.emailId")
    .isEmail()
    .withMessage("Invalid email address"),
  body("*.address.address")
    .isLength({ min: 1 })
    .withMessage("Address is required"),
  body("*.address.location.coordinates")
    .isArray()
    .withMessage("Location must be an array"),
  body("*.address.location.coordinates.*")
    .isFloat()
    .withMessage("Location coordinates must be floats"),
  body("*.address.pincode")
    .isPostalCode("IN")
    .withMessage("Invalid pin code for India"),
  body("*.address.state").isString().withMessage("State must be a string"),
  body("*.address.country").isString().withMessage("Country must be a string"),
];
