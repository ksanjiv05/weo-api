// Objective : Define the boost controller
// Author : Sanjiv Kumar Pandit

import { Request, Response } from "express";
import { Boost, IBoost } from "../../../models/boost.model";
import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import Offer, { IOffer } from "../../../models/offer.model";

// add boost to offer

export const addBoost = async (req: Request, res: Response) => {
  try {
    // start transaction session here for first save boost then and into offer
    const session = await Boost.startSession();
    session.startTransaction();

    try {
      const { offerId } = req.body;

      const offer = await Offer.findById(offerId);

      if (!offer) {
        return responseObj({
          resObj: res,
          type: "error",
          statusCode: HTTP_STATUS_CODES.NOT_FOUND,
          msg: "Offer not found",
          error: null,
          data: null,
          code: ERROR_CODES.NOT_FOUND,
        });
      }

      const boost: IBoost = new Boost(req.body);
      await boost.save();

      await Offer.findByIdAndUpdate(
        offerId,
        { $addToSet: { boost: boost._id } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.CREATED,
        msg: "Boost  added successfully",
        error: null,
        data: boost,
        code: ERROR_CODES.SUCCESS,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();

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
  } catch (error: any) {
    logging.error("Add Boost", error.message, error);

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
