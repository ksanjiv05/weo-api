import { Request, Response } from "express";
import { createOrder } from "../../../payment/razorpay/order";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import logging from "../../../config/logging";

export const newOrder = async (req: Request, res: Response) => {
  try {
    const { offerId, sellerId, amount, oDataId } = req.body;

    const order = await createOrder({
      amount,
      receipt: sellerId,
      notes: { offerId, oDataId },
    });
    if (order)
      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "order created successfully",
        error: null,
        data: order,
      });
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Unable to create order",
      error: null,
      data: null,
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
