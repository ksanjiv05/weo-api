// when any body try to collect offer then offer should be in live mode
import { Request, Response } from "express";
import logging from "../../../config/logging";
import Offer from "../../../models/Offer";
import { IOffer, OFFER_STATUS } from "../../../interfaces/IOffer";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import Collector from "../../../models/Collector";
import mongoose from "mongoose";

export const collectOffer = async (req: Request, res: Response) => {
  try {
    //{$in totalOffersAvailable}
    const session = await mongoose.startSession();
    session.startTransaction();

    const test = await Offer.updateOne(
      { _id: req.body.offer },
      { $inc: { totalOffersSold: 1, totalOffersAvailable: -1 } },
      { session }
    );
    console.log("test", test);

    await Collector.create(
      [
        {
          ...req.body,
        },
      ],
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

export const getCollectedOffers = async (req: Request, res: Response) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    req.body.creatorId = req.body.user.uid;

    const skip = (Number(page) - 1) * Number(perPage);

    const offers = await Collector.find({ uid: req.body.user.uid })
      .sort("-createdAt")
      .populate("offer")
      .skip(Number(skip))
      .limit(Number(perPage))
      .exec();
    const total = await Offer.find({ uid: req.body.user.uid }).count();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "all collected offers",
      error: null,
      data: { offers, total },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error(
      "Get Collected Offers",
      "unable to get collected Offers",
      error
    );
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get collected Offers",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
