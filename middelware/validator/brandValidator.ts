import { body } from "express-validator";

export const brandDataValidateCheckPointA = [
  body("uid").isString().notEmpty().withMessage("uid is required"),
  body("brandName").isString().notEmpty().withMessage("brandName is required"),
  body("brandDescription")
    .isString()
    .notEmpty()
    .withMessage("brandDescription is required"),
  body("status").isString().notEmpty().withMessage("status is required"),
  body("checkpoint")
    .isNumeric()
    .notEmpty()
    .withMessage("checkPoint is required"),
];

export const brandDataValidateCheckPointB = [
  ...brandDataValidateCheckPointA,
  body("categoriesIds")
    .isArray()
    .notEmpty()
    .withMessage("at least one categoriesId is required"),
];

export const brandDataValidateCheckPointC = [
  ...brandDataValidateCheckPointB,
  body("serviceLocationType")
    .isString()
    .notEmpty()
    .withMessage("serviceLocationType is required"),
  body("websiteLink")
    .isString()
    .notEmpty()
    .withMessage("websiteLink is required"),
  body("onlineServiceLocationType")
    .isString()
    .notEmpty()
    .withMessage("onlineServiceLocationType is required"),
  body("onlineLocations")
    .isArray()
    .notEmpty()
    .withMessage("at least one onlineLocations is required"),
  body("offlineLocations")
    .isArray()
    .notEmpty()
    .withMessage("at least one offlineLocations is required"),
];

export const brandDataValidateCheckPointD = [
  ...brandDataValidateCheckPointC,
  body("coverImage")
    .isString()
    .notEmpty()
    .withMessage("coverImage is required"),
  body("profileImage")
    .isString()
    .notEmpty()
    .withMessage("profileImage is required"),
];
