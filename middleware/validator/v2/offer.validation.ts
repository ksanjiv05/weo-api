// Objective : Define the Offer validation schema
// Author : Sanjiv Kumar Pandit

import { Request, Response } from "express";
import { body } from "express-validator";

export const offerValidationCh1 = [
  body("checkpoint").isNumeric().withMessage("checkpoint is required"),
  body("brand").isString().withMessage("brand is required"),
  body("outlets").isArray({ min: 1 }).withMessage("outlets is required"),
  body("subCategories").isArray().withMessage("subCategories is required"),
  body("offerName").isString().withMessage("offer name is required"),
  body("offerDescription")
    .isString()
    .withMessage("offer description is required"),
  body("boost").isArray().withMessage("boost is required"),
  body("offerStatus").isNumeric().withMessage("offer status is required"),
];

export const offerValidationCh2 = [
  ...offerValidationCh1,
  body("offerPriceAmount")
    .isNumeric()
    .withMessage("offer price amount is required"),
  body("offerPriceMinAmount")
    .isNumeric()
    .withMessage("offer price min amount is required"),
  body("offerPriceMinPercentage")
    .isNumeric()
    .withMessage("offer price min percentage is required"),
  body("paymentType").isString().withMessage("payment type is required"),
  body("installmentDuration")
    .isNumeric()
    .withMessage("installment duration is required"),
  body("installmentPeriod")
    .isString()
    .withMessage("installment period is required"),
];

export const offerValidationCh3 = [
  ...offerValidationCh2,
  body("totalOfferUnitItem")
    .isNumeric()
    .withMessage("total offer unit item is required"),
  body("offerUnitType").isString().withMessage("offer unit type is required"),
  body("minimumOfferUnitItem")
    .isNumeric()
    .withMessage("minimum offer unit item is required"),
  body("serviceStartDate")
    .isString()
    .withMessage("service start date is required"),
  body("serviceEndDate").isString().withMessage("service end date is required"),
];

export const offerValidationCh4 = [
  ...offerValidationCh3,
  body("offerLiveTillSoldOut")
    .isBoolean()
    .withMessage("offer live till sold out is required"),
  body("offerAvailabilityStartDate")
    .isString()
    .withMessage("offer availability start date is required"),
  body("offerAvailabilityEndDate")
    .isString()
    .withMessage("offer availability end date is required"),
  body("offerAvailableAllTime")
    .isBoolean()
    .withMessage("offer available all time is required"),
  body("offerAvailableDays")
    .isArray()
    .withMessage("offer available days is required"),
];

export const offerValidationCh5 = [
  ...offerValidationCh4,
  body("totalOffersAvailable")
    .isNumeric()
    .withMessage("total offers available is required"),
  body("offerReSellable")
    .isBoolean()
    .withMessage("offer re sellable is required"),
  body("offerLimitPerCustomer")
    .isNumeric()
    .withMessage("offer limit per customer is required"),
];

export const offerValidationCh6 = [
  ...offerValidationCh5,
  body("ORewardDeductPercentagePerSale")
    .isNumeric()
    .withMessage("O reward deduct percentage per sale is required"),
  body("ORewardDeductPercentageLatePayment")
    .isNumeric()
    .withMessage("O reward deduct percentage late payment is required"),
];

export const offerValidationCh7 = [
  ...offerValidationCh6,
  body("OfferMedia")
    .isArray({ min: 1, max: 5 })
    .withMessage("Offer media is required"),
];

// dynamic validation for each checkpoint
const offerValidation = (checkpoint: number) => {
  switch (checkpoint) {
    case 1:
      return offerValidationCh1;
    case 2:
      return offerValidationCh2;
    case 3:
      return offerValidationCh3;
    case 4:
      return offerValidationCh4;
    case 5:
      return offerValidationCh5;
    case 6:
      return offerValidationCh6;
    case 7:
      return offerValidationCh7;
    default:
      return offerValidationCh1;
  }
};

// middleware for validation according to checkpoint
export const validateOffer = (req: Request, res: Response) => {
  const { checkpoint } = req.params;
  return [...offerValidation(parseInt(checkpoint))];
};
