import { body } from "express-validator";

export const offerDataValidateCheckPointA = [
  // body("creatorId").isString().notEmpty().withMessage("creatorId is required"),
  body("brandId").isString().notEmpty().withMessage("brandId is required"),
  body("brandName").isString().notEmpty().withMessage("brandName is required"),
  body("checkpoint")
    .isNumeric()
    .notEmpty()
    .withMessage("checkpoint is required"),
];

export const offerDataValidateCheckPointB = [
  ...offerDataValidateCheckPointA,
  body("creatorId").isString().notEmpty().withMessage("creatorId is required"),
  // body("productIds")
  //   .isArray()
  //   .notEmpty()
  //   // .length({ min: 1 })
  //   .withMessage("at least one productId is required"),
];

export const offerDataValidateCheckPointC = [
  ...offerDataValidateCheckPointB,
  body("offerTitle")
    .isString()
    .notEmpty()
    .withMessage("offerTitle is required"),
  body("offerDescription")
    .isString()
    .notEmpty()
    .withMessage("offerDescription is required"),
];

export const offerDataValidateCheckPointD = [
  ...offerDataValidateCheckPointC,
  body("offerMedia")
    .isArray()
    .notEmpty()
    // .length({ min: 1 })
    .withMessage("at least one offerMedia is required"),
];

export const offerDataValidateCheckPointE = [
  ...offerDataValidateCheckPointD,
  // body("offerPriceType")
  //   .isString()
  //   .notEmpty()
  //   .withMessage("offerPriceType is required"),
  body("offerPriceAmount")
    .isNumeric()
    .notEmpty()
    .withMessage("offerPriceAmount is required"),
  body("offerPriceMinAmount")
    .isNumeric()
    .notEmpty()
    .withMessage("offerPriceAmount is required"),
  body("paymentType")
    .isString()
    .notEmpty()
    .withMessage("paymentType is required"),
  body("installmentPeriod")
    .if(body("paymentType").equals("installment"))
    .isString()
    .notEmpty()
    .withMessage("installmentPeriod is required"),

  body("installmentTimePeriod")
    .if(body("paymentType").equals("installment"))
    .isNumeric()
    .notEmpty()
    .withMessage("installmentTimePeriod is required"),
  body("installmentDuration")
    .if(body("paymentType").equals("installment"))
    .isNumeric()
    .notEmpty()
    .withMessage("installmentDuration is required"),
  // body("minAccessBalance")
  //   .isNumeric()
  //   .notEmpty()
  //   .withMessage("minAccessBalance is required"),
  // body("maxOAccess")
  //   .isNumeric()
  //   .notEmpty()
  //   .withMessage("maxOAccess is required"),

  body("serviceUnitName")
    .isString()
    .notEmpty()
    .withMessage("serviceUnitName is required"),
  body("totalServiceUnitType")
    .isString()
    .notEmpty()
    .withMessage("totalServiceUnitType is required"),
  body("totalServiceUnitItems")
    .isNumeric()
    .notEmpty()
    .withMessage("totalServiceUnitItems is required"),
  body("durationUnitType")
    .isString()
    .notEmpty()
    .withMessage("durationUnitType is required"),
  body("durationUnitItems")
    .isNumeric()
    .notEmpty()
    .withMessage("durationUnitItems is required"),
  body("totalOffersAvailable")
    .isNumeric()
    .notEmpty()
    .withMessage("totalOffersAvailable is required"),
  body("offerLimitPerCustomer")
    .isNumeric()
    .notEmpty()
    .withMessage("offerLimitPerCustomer is required"),
  body("offerActivitiesAt")
    .isString()
    .notEmpty()
    .withMessage("offerActivitiesAt is required"),
  body("offerActivationStartTime")
    .isString()
    .notEmpty()
    .withMessage("offerActivationStartTime is required"),
  body("offerActivationEndTime")
    .isString()
    .notEmpty()
    .withMessage("offerActivationEndTime is required"),
  body("offerValidityStartDate")
    .isString()
    .notEmpty()
    .withMessage("offerValidityStartDate is required"),
  body("offerValidityEndDate")
    .isString()
    .notEmpty()
    .withMessage("offerValidityEndDate is required"),
  body("offerStatus")
    .isString()
    .notEmpty()
    .withMessage("offerStatus is required"),
];

export const offerDataValidateCheckPointF = [
  ...offerDataValidateCheckPointE,
  body("offerThumbnailImage")
    .isString()
    .notEmpty()
    .withMessage("offerThumbnailImage is required"),
];

// const offerValidate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let { checkpoint = -1 } = req.body;
//   console.log("checkpoint", checkpoint);
//   switch (checkpoint) {
//     case 0:
//       offerDataValidateCheckPointA;
//       next();
//     case 1:
//       console.log("HIT checkpoint", checkpoint);
//       offerDataValidateCheckPointB;
//       next();
//     case 2:
//       offerDataValidateCheckPointC;
//     case 3:
//       offerDataValidateCheckPointD;
//     case 4:
//       offerDataValidateCheckPointE;
//     case 5:
//       offerDataValidateCheckPointF;
//     default:
//       return responseObj({
//         resObj: res,
//         type: "error",
//         statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
//         msg: "You have to provide checkpoint value 0 to 5",
//         error: null,
//         data: null,
//       });
//   }
// };

// export default offerValidate;
