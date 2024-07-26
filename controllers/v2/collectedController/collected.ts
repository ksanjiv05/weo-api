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
import { O_EVENTS, OFFER_STATUS } from "../../../config/enums";
import OfferData, { IOfferData } from "../../../models/offer.data.model";
import Wallet from "../../../models/wallet.model";
import { IRequest } from "../../../interfaces/IRequest";
import { oGenerate } from "../../../helper/oCalculator/v2";
import { getExchangeRate } from "../../../helper/exchangeRate";
import {
  BASE_CURRENCY,
  oNetworkConfig,
  oNetworkConfigLoad,
} from "../../../config/config";
import oLogModel, { IOLog } from "../../../models/oLog.model";
import { getDaysBetweenTwoDate } from "../../../helper/utils";

// define function for create Collected
//TODO: created Collected logic not implemented yet

//
export const collectOffer = async (req: IRequest, res: Response) => {
  // offerPriceAmount: number; // price of the offer
  // offerPriceMinAmount: number; // min negotiable amount

  const {
    id,
    noOfOffers = 1,
    quantity,
    duration,
    amount,
    offerDataId,
  } = req.body;
  console.log("collect ", req.body);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const offer = await Offer.findOne({
      _id: id,
      offerStatus: OFFER_STATUS.LIVE,
      totalOffersAvailable: { $gte: noOfOffers },
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

    const offerDataPoint: IOfferData | null = await OfferData.findOne({
      _id: offerDataId,
      minimumOfferUnitItem: { $lte: quantity },
      // $and: [
      //   {
      //     offerPriceMinAmount: { $gte: amount },
      //   },
      //   {
      //     minimumOfferUnitItem: { $gte: quantity },
      //   },
      // ],
    });
    console.log(
      "offerDataPoint",
      offerDataPoint?.minimumOfferUnitItem,
      quantity
    );

    if (!offerDataPoint) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Negotiation not meet criteria",
        error: "Negotiation not meet criteria",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const oneQtyOfferValue =
      offerDataPoint.offerPriceAmount / offerDataPoint.totalOfferUnitItem;
    const offerValueAfterDiscount =
      (noOfOffers *
        oneQtyOfferValue *
        quantity *
        offerDataPoint.offerPriceMinPercentage) /
      100;
    // const offerRevisedValue = oneQtyOfferValue * quantity * noOfOffers;

    const serviceEndDate = offerDataPoint.serviceEndDate;
    const serviceStartDate = offerDataPoint.serviceStartDate;

    const serviceDays = getDaysBetweenTwoDate(serviceStartDate, serviceEndDate);

    console.log("________________________");
    console.log("actual  value", {
      offerValueAfterDiscount,
      serviceDays,
    });

    console.log("_________your_______________");

    console.log({
      amount,
      duration,
    });

    if (serviceDays >= duration && offerValueAfterDiscount >= amount) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Negotiation not meet criteria",
        error: "Negotiation not meet criteria",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }
    // if (!(offerDataPoint.offerPriceMinAmount * noOfOffers > amount)) {
    //   return responseObj({
    //     resObj: res,
    //     type: "error",
    //     statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    //     msg: "Offer purposed amount is declined",
    //     error: "Offer purposed amount is declined",
    //     data: null,
    //     code: ERROR_CODES.FIELD_VALIDATION_ERR,
    //   });
    // }

    const newOfferCollected = new Collected(req.body);
    newOfferCollected.offer = id;

    offer.totalOffersAvailable = offer.totalOffersAvailable - noOfOffers;
    offer.totalOfferSold = offer.totalOfferSold + noOfOffers;
    const uid = req.user._id;

    const wallet = await Wallet.findOne({ user: uid });
    if (!wallet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Wallet not found",
        error: "Wallet not found",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }
    if (wallet.balance < amount * noOfOffers) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Insufficient balance",
        error: "Insufficient balance",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }

    wallet.balance = wallet.balance - amount * 100;
    const exchangeRate = 83.33; //await getExchangeRate(wallet.currency, BASE_CURRENCY);
    const amountAfterExchange = amount * exchangeRate;
    const { toDistribute, totalO } = await oGenerate({
      amount: amountAfterExchange,
      discount: 0,
    });

    wallet.oBalance = wallet.oBalance + toDistribute / 2;

    const newOLog = new oLogModel({
      event: O_EVENTS.COLLECTED,
      amount: amountAfterExchange,
      offerId: id,
      seller: { id: offer.user, oQuantity: toDistribute / 2 },
      buyer: { id: req.user._id, oQuantity: toDistribute / 2 },
      discount: 0,
      quantity: noOfOffers,

      oPriceRate: oNetworkConfig.price,
      oAgainstPrice: oNetworkConfig.oAgainstPrice,
      oGenerated: totalO,
      atPlatformCutOffRate: oNetworkConfig.atPlatformCutOffRate,
      atRateCutOffFromDiscount: oNetworkConfig.atRateCutOffFromDiscount,
      toPlatformCutOffRateFromDiscount:
        oNetworkConfig.toPlatformCutOffRateFromDiscount,
      toPlatformCutOffRate: oNetworkConfig.toPlatformCutOffRate,
    });

    console.log("newOLog", newOLog);

    // {
    //   owner: [
    //     {
    //       ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    //       isCurrentOwner: { type: Boolean, default: true },
    //     },
    //   ],
    //   transaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
    //   offer_access_codes: [
    //     {
    //       code: { type: String },
    //       status: { type: String },
    //     },
    //   ],
    //   deliveryCount: { type: Number, default: 0 },
    //   currentInstallment: { type: Number, default: 0 },
    //   totalInstallment: { type: Number, default: 0 },
    //   installmentDueDate: { type: String },
    //   offerActivationDate: { type: String },
    //   offerExpiryDate: { type: String },
    //   quantity: String,
    // },

    await offer.save({ session });
    await wallet.save({ session });
    await newOfferCollected.save({ session });
    await newOLog.save({ session });

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
