import { Request, Response } from "express";
import { createOrder } from "../../../payment/razorpay/order";
import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import {
  addBankAccount,
  createVirtualAccount,
} from "../../../payment/razorpay/account";
import {
  createDirectTransfer,
  transfer,
} from "../../../payment/razorpay/transfer";
import instance from "../../../payment/razorpay";
import { createRefund } from "../../../payment/razorpay/refund";

export const createOfferOrder = async (req: Request, res: Response) => {
  try {
    const order = await createOrder({
      amount: 50000,
      receipt: "offer-1",
    });
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "order created successfully",
      error: null,
      data: order,
    });
  } catch (error: any) {
    console.log(error);
    logging.error("Order Create", "Unable to create order ", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to create order",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};

export const createSellerAccount = async (req: Request, res: Response) => {
  try {
    // const vac = await createVirtualAccount({
    //   ifsc: "HDFC0000001",
    //   account_number: "0000000000000001",
    //   description: "Seller Account",
    //   uid: "user-1",
    //   bank_name: "HDFC",
    // });

    const acc = await addBankAccount({
      ifsc_code: "HDFC0000001",
      uid: "user-1",
      email: "ksanjiv0005@gmail.com",
      business_name: "test",
      beneficiary_name: "sanjiv",
      account_type: "saving",
      account_number: "0000000000000001",
      name: "sanjiv",
      contact: "",
      contactId: undefined,
    });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "virtual account created successfully",
      error: null,
      data: acc,
    });
  } catch (error: any) {
    console.log(error);
    logging.error(
      "Virtual Account Create",
      "Unable to create virtual account ",
      error
    );
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to create virtual account",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};

export const initiateTransfer = async (req: Request, res: Response) => {
  try {
    const { paymentId, account, amount, currency, name } = req.body;
    const transfer = await createDirectTransfer({
      account,
      amount,
      currency,
    });
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "transfer initiated successfully",
      error: null,
      data: transfer,
    });
  } catch (error: any) {
    console.log(error);
    logging.error(
      "Amount Transfer Error",
      "Unable to initiate transfer ",
      error
    );
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to initiate transfer",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};

export const getAccountDetails = async (req: Request, res: Response) => {
  try {
    const { account_id } = req.body;
    const account = await instance.accounts.fetch(account_id);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "account details fetched successfully",
      error: null,
      data: account,
    });
  } catch (error: any) {
    console.log(error);
    logging.error(
      "Account Details Error",
      "Unable to fetch account details ",
      error
    );
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to fetch account details",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};

// export const getAccountDetailsByUid = async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.body;
//     const account = await instance.accounts.fetchByCustomerId(uid);
//     return responseObj({
//       resObj: res,
//       type: "success",
//       statusCode: HTTP_STATUS_CODES.SUCCESS,
//       msg: "account details fetched successfully",
//       error: null,
//       data: account,
//     });
//   } catch (error: any) {
//     console.log(error);
//     logging.error(
//       "Account Details Error",
//       "Unable to fetch account details ",
//       error
//     );
//     return responseObj({
//       resObj: res,
//       type: "error",
//       statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       msg: "Unable to fetch account details",
//       error: error.message ? error.message : error,
//       data: null,
//     });
//   }
// }

export const initiateRefund = async (req: Request, res: Response) => {
  try {
    const { paymentId, amount, currency, notes } = req.body;
    const refund = createRefund({
      paymentId,
      amount,
      // currency,
      notes,
    });
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "refund initiated successfully",
      error: null,
      data: refund,
    });
  } catch (error: any) {
    console.log(error);
    logging.error("Refund Error", "Unable to initiate refund ", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to initiate refund",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};
