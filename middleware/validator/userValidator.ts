import { body } from "express-validator";

export const userDataValidateCheckPointA = [
  body("uid").isString().notEmpty().withMessage("uid is required"),
  body("name").isString().notEmpty().withMessage("name is required"),
  body("phone").isString().notEmpty().withMessage("phone is required"),
  //   body("fcmToken").isString().notEmpty().withMessage("fcmToken is required"),
];

export const userDataValidateCheckPointForCreatorName = [
  body("creatorName").isString().notEmpty().withMessage("uid is required"),
];

export const userDataValidateCheckPointB = [
  ...userDataValidateCheckPointA,
  body("email").isString().notEmpty().withMessage("email is required"),
  body("address").isString().notEmpty().withMessage("address is required"),
  body("pincode").isString().notEmpty().withMessage("pincode is required"),
  body("city").isString().notEmpty().withMessage("city is required"),
  body("landmark").isString().notEmpty().withMessage("landmark is required"),
];

export const userNewBankAccountValidate = [
  body("accountNumber")
    .isString()
    .notEmpty()
    .withMessage("account number is required"),
  body("ifsc").isString().notEmpty().withMessage("ifsc is required"),
  body("bankName").isString().notEmpty().withMessage("bank name is required"),
  body("accountHolderName")
    .isString()
    .notEmpty()
    .withMessage("account holder name is required"),
];
