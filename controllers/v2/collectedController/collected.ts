// Objective : define the Collected controller for the v2 API
//Author: sanjiv kumar pandit

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Collected, { ICollected } from "../../../models/collected.model";
import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import Offer from "../../../models/offer.model";
import Outlet from "../../../models/outlet.model";
import Brand from "../../../models/brand.model";
import mongoose from "mongoose";
import { OFFER_STATUS } from "../../../config/enums";
import OfferData, { IOfferData } from "../../../models/offer.data.model";
import Wallet from "../../../models/wallet.model";
import { IRequest } from "../../../interfaces/IRequest";
import { oGenerate } from "../../../helper/oCalculator/v2";
import { getExchangeRate } from "../../../helper/exchangeRate";
import { BASE_CURRENCY } from "../../../config/config";

// define function for create Collected
//TODO: created Collected logic not implemented yet

//
export const collectOffer = async (req: IRequest, res: Response) => {
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

  // offerPriceAmount: number; // price of the offer
  // offerPriceMinAmount: number; // min negotiable amount

  const { id, quantity = 1, amount, offerDataId } = req.body;
  const offer = await Offer.findOne({
    _id: id,
    offerStatus: OFFER_STATUS.LIVE,
    totalOffersAvailable: { $gte: quantity },
  });
  if (!offer) {
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      msg: "Offer not found",
      error: "Offer not found",
      data: null,
      code: ERROR_CODES.NOT_FOUND,
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const offerDataPoint: IOfferData | null = await OfferData.findOne({
      _id: offerDataId,
    });

    if (!offerDataPoint) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Offer not not found",
        error: "Offer not not found",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }
    if (!(offerDataPoint.offerPriceMinAmount * quantity > amount)) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Offer purposed amount is declined",
        error: "Offer purposed amount is declined",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const newOfferCollected = new Collected(req.body);
    newOfferCollected.offer = id;

    offer.totalOffersAvailable = offer.totalOffersAvailable - quantity;
    offer.totalOfferSold = offer.totalOfferSold + quantity;
    const uid = req.user._id;

    const wallet = await Wallet.findOne({ user: uid });
    if (!wallet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Wallet not found",
        error: "Wallet not found",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    wallet.balance = wallet.balance - amount * 100;
    const exchangeRate = await getExchangeRate(wallet.currency, BASE_CURRENCY);
    const amountAfterExchange = amount * exchangeRate;
    const { toDistribute, totalO } = await oGenerate({
      amount: amountAfterExchange,
      discount: 0,
    });

    wallet.oBalance = wallet.oBalance + toDistribute / 2;

    await offer.save({ session });
    await wallet.save({ session });
    await newOfferCollected.save({ session });

    await session.commitTransaction();
    session.endSession();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Offer Collected",
      error: null,
      data: newOfferCollected,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logging.error("Collected Offer", error.message, error);

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

// define function for get Collected offer

export const getCollectedOffers = async (req: Request, res: Response) => {
  try {
    //add filter for Collected offer by nearby outlet
    const { brandId } = req.params;

    const offers = await Offer.find({ brand: brandId }).populate(
      "offerDataPoints"
    );

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer",
      error: null,
      data: offers,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Collected Offer", error.message, error);
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

export const getAllCollectedBrands = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    // const brands = await Brand.find({ user: user._id });

    const brands = await Brand.aggregate([
      {
        $match: {
          user: user._id,
        },
      },

      {
        $lookup: {
          from: "offer",
          localField: "_id",
          foreignField: "brand",
          as: "offers",
          pipeline: [
            {
              $match: {
                status: {
                  $ne: 1, // 1: pending or draft
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalPushedOffers: {
            $size: {
              $filter: {
                input: "$offers",
                as: "offer",
                cond: {
                  $eq: ["$$offer.status", 3], // 3: pushed
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          completed: {
            $size: {
              $filter: {
                input: "$offers",
                as: "offer",
                cond: {
                  $eq: ["$$offer.status", 4], // 4: sold out
                },
              },
            },
          },
        },
      },

      {
        $unwind: "$offers",
      },
      {
        $group: {
          _id: "$_id",
          brandName: {
            $first: "$brandName",
          },
          brandDescription: {
            $first: "$brandDescription",
          },
          brandLogo: {
            $first: "$brandLogo",
          },
          categoryId: {
            $first: "$categoryId",
          },
          status: {
            $first: "$status",
          },
          checkpoint: {
            $first: "$checkpoint",
          },
          outlets: {
            $first: "$outlets",
          },
          totalPushedOffers: {
            $first: "$totalPushedOffers",
          },
          offers: {
            $push: {
              offerId: "$offers._id",
              // pending: {
              //   $subtract: ["$offers.totalCollected", "$offers.sold"],
              // },
              // completed: "$offers.sold",
              // Collected: "$offers.totalCollected",
              // pending: {
              //   $subtract: ["$offers.totalCollected", "$offers.sold"],
              // },
              completed: "$completed",
              Collected: { $size: "$offers" },
              // Collected: "$offers.totalCollected",
              boosted: {
                $size: "$offers.boost",
              },
              status: "$offers.status",
            },
          },
        },
      },
      {
        $project: {
          brandName: 1,
          brandDescription: 1,
          brandLogo: 1,
          categoryId: 1,
          status: 1,
          checkpoint: 1,
          outlets: 1,
          totalPushedOffers: 1,
          offers: 1,
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "All brands",
      error: null,
      data: brands,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get all brands", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brands not found",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
