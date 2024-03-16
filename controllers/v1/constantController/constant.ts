import { Request, Response } from "express";
import { ERROR_CODES } from "../../../config/errorCode";
import logging from "../../../config/logging";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { SERVICE_UNITS } from "../../../constants";
import { responseObj } from "../../../helper/response";

export const getServiceUnits = async (req: Request, res: Response) => {
  try {
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "all offers",
      error: null,
      data: {
        serviceUnits: SERVICE_UNITS,
      },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Service Units", "unable to get units", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get units",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
