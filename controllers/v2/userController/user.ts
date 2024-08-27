import { Response } from "express";
import { responseObj } from "../../../helper/response";
import { IRequest } from "../../../interfaces/IRequest";
import {
  addBankAccount,
  addFundAccount,
} from "../../../payment/razorpay/account";
import logging from "../../../config/logging";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import Wallet from "../../../models/wallet.model";
import { fundTransfer } from "../../../payment/razorpay/transfer";
import { validationResult } from "express-validator";
import { getOConfig } from "../../../helper/oCalculator/v2";

export const newBankAccount = async (req: IRequest, res: Response) => {
  try {
    const { user } = req;
    const {
      accountNumber,
      ifsc,
      businessName = "default",
      accountType = "vendor", //vendor | employee|customer|self
      bankName = "",
      accountHolderName = "",
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "fields are required",
        error: errors.array({}),
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const contactId =
      user.bankAccounts.length > 0 ? user.bankAccounts[0]?.contactId : null;
    // const account = await addBankAccount({
    //   ifsc_code: ifsc,
    //   uid: user._id,
    //   email: user.email,
    //   business_name: business_name === "default" ? user.name : business_name,
    //   beneficiary_name: user.name,
    //   account_type: accountType,
    //   account_number: accountNumber,
    //   name: user.name,
    // });

    const account = await addFundAccount({
      ifsc_code: ifsc,
      uid: user._id,
      email: user.email,
      business_name:
        businessName === "default" ? accountHolderName : businessName,
      beneficiary_name: accountHolderName,
      account_type: accountType,
      account_number: accountNumber,
      name: accountHolderName,
      contact: user.phone,
      contactId: contactId,
    });
    console.log("create bank account", account);

    if (!account.status) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: 400,
        msg: "Unable to create account",
        error: account.data,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }

    const { id = "" } = account.data;

    user.bankAccounts = [
      ...user.bankAccounts,
      {
        accountId: id,
        isPrimary: false,
        accountHolderName: accountHolderName,
        bankName: bankName,
        lastFourDigits: accountNumber.substring(accountNumber.length - 4),
      },
    ];
    console.log("create bank account", user);
    await user.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: 200,
      msg: "account created successfully",
      error: null,
      data: account,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Create Bank Account", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: 500,
      msg: "Unable to create account",
      error: error.message ? error.message : error,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const changePrimaryBankAccount = async (
  req: IRequest,
  res: Response
) => {
  try {
    const { user } = req;
    const { accountId } = req.body;
    if (!accountId) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: 400,
        msg: "account id is required",
        error: null,
        data: null,
      });
    }
    const { accounts } = user;
    const index = accounts.findIndex(
      (account: any) => account.accountId === accountId
    );
    if (index === -1) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: 404,
        msg: "account not found",
        error: null,
        data: null,
      });
    }
    const newAccounts = accounts.map((account: any) => {
      if (account.accountId === accountId) {
        account.isPrimary = true;
      } else {
        account.isPrimary = false;
      }
      return account;
    });
    user.accounts = newAccounts;
    await user.save();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: 200,
      msg: "account changed successfully",
      error: null,
      data: null,
    });
  } catch (error: any) {
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: 500,
      msg: "Unable to change account",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};

export const getWallet = async (req: IRequest, res: Response) => {
  try {
    const { user } = req;
    const wallet = await Wallet.findOne({ user: user._id }).populate("user");
    const config = getOConfig();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "wallet details fetched successfully",
      error: null,
      data: { wallet, config },
    });
  } catch (error: any) {
    logging.error(
      "Wallet Details",
      "Unable to get wallet details ",
      error.message
    );
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to get wallet details",
      error: error.message ? error.message : error,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const withdrawFunds = async (req: IRequest, res: Response) => {
  try {
    const { user } = req;
    const { amount, accountId } = req.body;
    if (!amount) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "amount is required",
        error: null,
        data: null,
      });
    }
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "wallet not found",
        error: null,
        data: null,
      });
    }
    wallet.balance = wallet.balance - amount * 100;

    const status = await fundTransfer({
      user: user._id,
      account: accountId,
      amount: amount * 100,
      currency: "INR",
      name: user.name,
      purpose: "withdraw",
    });
    await wallet.save();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "funds withdrawn successfully",
      error: null,
      data: wallet,
    });
  } catch (error: any) {
    console.log(error);
    logging.error("Order Create", "Unable to create order ", error.message);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to create order",
      error: error.message ? error.message : error,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// export const addFundAccount = async (req: IRequest, res: Response) => {
//   try {
//   } catch (error: any) {
//     console.log(error);
//     logging.error("Order Create", "Unable to create order ", error.message);
//     return responseObj({
//       resObj: res,
//       type: "error",
//       statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       msg: "Unable to create order",
//       error: error.message ? error.message : error,
//       data: null,
//       code: ERROR_CODES.SERVER_ERR,
//     });
//   }
// };

export const getWalletDetails = async (req: IRequest, res: Response) => {};

// export const newWalletAddress = async (req: IRequest, res: Response) => {
//   try {
//     const { user } = req;
//     const {  } = req.body;
//     if (!address) {
//       return responseObj({
//         resObj: res,
//         type: "error",
//         statusCode: 400,
//         msg: "address is required",
//         error: null,
//         data: null,
//       });
//     }
//     user.walletAddress = address;
//     await user.save();
//     return responseObj({
//       resObj: res,
//       type: "success",
//       statusCode: 200,
//       msg: "wallet address added successfully",
//       error: null,
//       data: null,
//     });
//   } catch (error: any) {
//     return responseObj({
//       resObj: res,
//       type: "error",
//       statusCode: 500,
//       msg: "Unable to add wallet address",
//       error: error.message ? error.message : error,
//       data: null,
//     });
//   }
// }
