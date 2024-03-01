// when any body try to collect offer then offer should be in live mode
import { Request, Response } from "express";
import logging from "../../config/logging";
import Offer from "../../models/Offer";
import { IOffer, OFFER_STATUS } from "../../interfaces/IOffer";
import { responseObj } from "../../helper/response";
import { HTTP_STATUS_CODES } from "../../config/statusCode";
import { validationResult } from "express-validator";
import { ERROR_CODES } from "../../config/errorCode";
import Collector from "../../models/Collector";
import mongoose from "mongoose";

export const collect = async (req: Request, res: Response) => {
  try {
    //{$in totalOffersAvailable}
    const session = await mongoose.startSession();
    session.startTransaction();

    await Offer.updateOne(
      { _id: req.body._id },
      { $set: { $inc: { totalOffersSold: 1, totalOffersAvailable: -1 } } },
      { session }
    );

    await Collector.create(
      {
        ...req.body,
        createdAt: Date.now(),
        updateAt: Date.now(),
      },
      { session: session }
    );

    // await newCollector.save();
    await session.commitTransaction();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully collected Offer",
      error: null,
      data: {
        offer: null,
      },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Collector", "unable to collect Offer", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to collect Offer",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
