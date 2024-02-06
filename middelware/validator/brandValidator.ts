import { body } from "express-validator";

export const brandDataValidateCheckPointA = [
  body("uid").isString().notEmpty().withMessage("uid is required"),
  body("creatorName")
    .isString()
    .notEmpty()
    .withMessage("creatorName is required"),
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
  body("onlineLocations.*.address")
    .isString()
    .notEmpty()
    .withMessage("address is required"),
  body("onlineLocations.*.location")
    .notEmpty()
    .isArray()
    .withMessage("location is required"),

  body("offlineLocations")
    .isArray()
    .notEmpty()
    .withMessage("at least one offlineLocations is required"),
  body("offlineLocations.*.address")
    .isString()
    .notEmpty()
    .withMessage("address is required"),

  body("offlineLocations.*.location")
    .notEmpty()
    .isArray()
    .withMessage("location is required"),
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
