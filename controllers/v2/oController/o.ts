import { Request, Response } from "express";
import { getOConfig, oGenerate } from "../../../helper/oCalculator/v2";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import logging from "../../../config/logging";
import { getExchangeRate } from "../../../helper/exchangeRate";
import { BASE_CURRENCY } from "../../../config/config";
import { IRequest } from "../../../interfaces/IRequest";

export const oRewardCalculate = async (req: IRequest, res: Response) => {
  try {
    const { amount, discount } = req.body;

    if (!amount || !discount) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "fields are required",
        error: null,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }

    const oConfig = await getOConfig();
    const exchangeRate = await getExchangeRate(
      req.user.currency,
      BASE_CURRENCY
    );
    const amountAfterExchange = amount * exchangeRate;

    const { totalO, toDistribute } = await oGenerate({
      amount: amountAfterExchange,
      discount,
      oNetworkConfig: oConfig,
    });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "your o reward which you can earn",
      error: null,
      data: {
        // totalO,
        reward: toDistribute / 2,
      },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("oRewardCalculate", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
