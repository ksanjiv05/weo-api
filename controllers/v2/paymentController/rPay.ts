import { Request, Response } from "express";
import { createOrder } from "../../../payment/razorpay/order";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import logging from "../../../config/logging";
import { IRequest } from "../../../interfaces/IRequest";
import { ORDER_TYPE } from "../../../config/enums";
import { ERROR_CODES } from "../../../config/errorCode";

export const newPurchaseOrder = async (req: IRequest, res: Response) => {
  try {
    const { offerId, sellerId, amount, oDataId } = req.body;
    const { currency } = req.user;

    if (
      currency === "KWD" ||
      currency === "OMR" ||
      currency === "BHD" ||
      currency === "OMR" ||
      currency === "JPY"
    ) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "we are not support this currencies KWD, JPY, BHD and OMR",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    const order = await createOrder({
      amount: amount * 100,
      receipt: sellerId,
      notes: { offerId, oDataId, type: ORDER_TYPE.PURCHASE },
      currency,
    });
    if (order)
      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "order created successfully",
        error: null,
        data: order,
        code: ERROR_CODES.SUCCESS,
      });
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to create order",
      error: null,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
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
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const newTopUpOrder = async (req: IRequest, res: Response) => {
  try {
    const { amount } = req.body;
    console.log("---",req.user);
    const { currency } = req.user;
    if (
      currency === "KWD" ||
      currency === "OMR" ||
      currency === "BHD" ||
      currency === "OMR" ||
      currency === "JPY"
    ) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Top up not allowed for this currencies KWD, JPY, BHD and OMR",
        error: null,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }
    const order = await createOrder({
      amount: amount * 100,
      receipt: req.user._id,
      notes: { user: req.user._id, type: ORDER_TYPE.TOPUP },
      currency: currency.toUpperCase(),
    });
    console.log("----",order);
    if (order)
      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "order created successfully",
        error: null,
        data: order,
        code: ERROR_CODES.SUCCESS,
      });
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to create order",
      error: null,
      data: order,
      code: ERROR_CODES.SERVER_ERR,
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
