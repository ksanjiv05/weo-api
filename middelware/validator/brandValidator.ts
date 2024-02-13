import { NextFunction, Request, Response } from "express";
import { validationResult, ContextRunner, body } from "express-validator";
import { responseObj } from "../../helper/response";
import { HTTP_STATUS_CODES } from "../../config/statusCode";
import { ERROR_CODES } from "../../config/errorCode";

export const brandDataValidateCheckPointA = [
  body("uid").isString().notEmpty().withMessage("uid is required"),
  // body("creatorName")
  //   .isString()
  //   .notEmpty()
  //   .withMessage("creatorName is required"),
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
  // body("onlineLocations")
  //   .isArray()
  //   .notEmpty()
  //   .withMessage("at least one onlineLocations is required"),
  // body("onlineLocations.*.address")
  //   .isString()
  //   .notEmpty()
  //   .withMessage("address is required"),
  // body("onlineLocations.*.location")
  //   .notEmpty()
  //   .isArray()
  //   .withMessage("location is required"),

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

// business goals to be added later after finalise

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

export const brandDataValidateCheckPoint = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { checkpoint = 1 } = req.body;
  console.log("requset", checkpoint);
  if (checkpoint === 1) {
    return brandDataValidateCheckPointA;
  }
  if (checkpoint === 2) {
    return brandDataValidateCheckPointB;
  }
  if (checkpoint === 3) {
    return brandDataValidateCheckPointC;
  }
  if (checkpoint === 4) {
    return brandDataValidateCheckPointD;
  }
  if (checkpoint === 5) {
    console.log("--");
    brandDataValidateCheckPointD;
  }
};

export const validateBrand = (validations: ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { checkpoint = 1 } = req.body;
    validations = [];
    if (checkpoint === 1) {
      validations = brandDataValidateCheckPointA;
    }
    if (checkpoint === 2) {
      validations = brandDataValidateCheckPointB;
    }
    if (checkpoint === 3) {
      validations = brandDataValidateCheckPointC;
    }
    if (checkpoint === 4) {
      validations = brandDataValidateCheckPointD;
    }
    if (checkpoint === 5) {
      validations = brandDataValidateCheckPointD;
    }

    for (let validation of validations) {
      const result = await validation.run(req);
      // if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      msg: "fields are required",
      error: errors.array({}),
      data: null,
      code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
    });
  };
};
