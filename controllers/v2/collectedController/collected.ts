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
import {
  O_EVENTS,
  OFFER_COLLECTION_EVENTS,
  OFFER_STATUS,
  OFFER_TYPE,
} from "../../../config/enums";
import OfferData, { IOfferData } from "../../../models/offer.data.model";
import Wallet from "../../../models/wallet.model";
import { IRequest } from "../../../interfaces/IRequest";
import { getOConfig, oGenerate } from "../../../helper/oCalculator/v2";
import { getExchangeRate } from "../../../helper/exchangeRate";
import { BASE_CURRENCY, negotiationConfig } from "../../../config/config";
import oLogModel, { IOLog } from "../../../models/oLog.model";
import {
  encrypt,
  encryptText,
  generateQR,
  getDaysBetweenTwoDate,
} from "../../../helper/utils";
import { v4 } from "uuid";
import listedModel from "../../../models/listed.model";
import Ownership from "../../../models/ownership.model";
import NegotiationAttempt from "../../../models/negotiationAttempt.model";

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
    isFullPayment = false,
    noOfInstallments = 1,
    negotiationAttemptInstance = null,
    outletId = null,
  } = req.body;

  const session = await Collected.startSession();
  session.startTransaction();
  try {
    const offer = await Offer.findOne({
      _id: id,
      offerStatus: OFFER_STATUS.LIVE,
      totalOffersAvailable: { $gte: noOfOffers },
    });
    const remainingAttempts = negotiationAttemptInstance
      ? negotiationConfig.maxAttempts - negotiationAttemptInstance?.noOfAttempts
      : negotiationConfig.maxAttempts;
    const remainingFreeAttempts = negotiationAttemptInstance
      ? negotiationConfig.freeAttempts -
        negotiationAttemptInstance?.noOfAttempts
      : negotiationConfig.freeAttempts;
    console.log(
      "remainingAttempts --- ",
      negotiationAttemptInstance,
      remainingAttempts,
      negotiationConfig.maxAttempts - negotiationAttemptInstance?.noOfAttempts
    );
    if (!offer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Offer not found",
        error: "Offer not found",
        data: {
          remainingAttempts,
          remainingFreeAttempts,
        },
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
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
        msg: "Offer not found",
        error: "Offer not found",
        data: {
          remainingAttempts,
          remainingFreeAttempts,
        },
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
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
        data: {
          remainingAttempts,
          remainingFreeAttempts,
        },
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

    const newOfferCollected = new Collected({
      offer: id,
      brand: offer.brand,
      user: req.user._id,
      offerDataId: offerDataId,
      offerName: offer.offerName,
      offerThumbnail: offerDataPoint.offerThumbnail,
      outlet: outletId,
    });

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
        data: {
          remainingAttempts: negotiationAttemptInstance
            ? negotiationConfig.maxAttempts -
              negotiationAttemptInstance?.noOfAttempts
            : negotiationConfig.maxAttempts,
        },
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }
    if (wallet.balance < amount * noOfOffers * 100) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Insufficient balance",
        error: "Insufficient balance",
        data: {
          remainingAttempts: negotiationAttemptInstance
            ? negotiationConfig.maxAttempts -
              negotiationAttemptInstance?.noOfAttempts
            : negotiationConfig.maxAttempts,
        },
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }

    wallet.balance = wallet.balance - amount * noOfOffers * 100;
    const exchangeRate = await getExchangeRate(wallet.currency, BASE_CURRENCY);
    const amountAfterExchange = amount * exchangeRate;
    const oNetworkConfig = await getOConfig();
    if (!oNetworkConfig) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Network not initialize",
        error: "Network not initialize",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }
    const { toDistribute, totalO } = await oGenerate({
      amount: amountAfterExchange,
      discount: offerDataPoint.offerPriceMinPercentage,
      oNetworkConfig,
    });

    console.log("_______toDistribute_____after collect________");
    console.log({
      exchangeRate,
      amountAfterExchange,
      toDistribute,
      totalO,
    });

    const deductOBalance =
      req.body?.negotiationAttemptInstance &&
      req.body.negotiationAttemptInstance.noOfAttempts >
        negotiationConfig.freeAttempts
        ? negotiationConfig.oCharge
        : 0;

    wallet.oBalance = wallet.oBalance + toDistribute / 2 - deductOBalance;

    const newOLog = new oLogModel({
      event: O_EVENTS.COLLECTED,
      amount: amount * noOfOffers,
      offer: id,
      brand: offer.brand,
      seller: { id: offer.user, oQuantity: toDistribute / 2 },
      buyer: { id: req.user._id, oQuantity: toDistribute / 2 },
      discount: offerDataPoint.offerPriceMinPercentage,
      quantity: noOfOffers,
      oAgainstPrice: oNetworkConfig.oAgainstPrice,
      oGenerated: totalO,
      atPlatformCutOffRate: oNetworkConfig.atPlatformCutOffRate,
      atRateCutOffFromDiscount: oNetworkConfig.atRateCutOffFromDiscount,
      toPlatformCutOffRateFromDiscount:
        oNetworkConfig.toPlatformCutOffRateFromDiscount,
      toPlatformCutOffRate: oNetworkConfig.toPlatformCutOffRate,
    });

    const newOwnerShip = new Ownership({
      owner: [
        {
          ownerId: req.user._id,
          isCurrentOwner: true,
        },
      ],
      transactions: [newOLog._id],
      offer_access_codes: [
        {
          code: newOfferCollected._id,
          status: OFFER_COLLECTION_EVENTS.COLLECTED,
        },
      ],
      isFullPayment,
      offerExpiryDate: offerDataPoint.serviceEndDate,
      currentInstallment: amount * noOfOffers,
      totalInstallment: isFullPayment
        ? amount
        : noOfInstallments * amount * noOfOffers,
      noOfInstallments: isFullPayment ? 1 : noOfInstallments,
      pendingInstallment: noOfInstallments - 1,
      quantity: quantity,
      spent: amount * noOfOffers,
      oEarned: toDistribute / 2,
    });

    await listedModel.updateOne(
      { offer: id },
      {
        // $push: {
        //   ownership: newOwnerShip._id,
        // },
        $addToSet: {
          ownerships: newOwnerShip._id,
        },
      },
      {
        session,
      }
    );

    newOfferCollected.ownerships = newOwnerShip._id;
    await newOwnerShip.save({ session });
    console.log("--0--");
    console.log("--1--");

    await wallet.save({ session });
    console.log("--2--");

    await newOfferCollected.save({ session });
    console.log("--3--");
    await newOLog.save({ session });
    console.log("--4--");
    await offer.save({ session });
    console.log("--5 --", offer);
    debugger;
    await session.commitTransaction();
    await session.endSession();
    console.log("--6--");
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
    debugger;
    await session.abortTransaction();
    await session.endSession();
    if (negotiationAttemptInstance) {
      negotiationAttemptInstance.noOfAttempts -= 1;
      await negotiationAttemptInstance.save();
    }
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

export const getNumberOfAttempts = async (req: IRequest, res: Response) => {
  try {
    const offerId = req.query.offerId;
    console.log({
      offer: offerId,
      user: req.user._id,
    });
    const attempts = await NegotiationAttempt.findOne({
      offer: offerId,
      user: req.user._id,
    });
    if (!attempts) {
      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "Collected Offer",
        error: null,
        data: {
          attempts: {
            offer: offerId,
            user: req.user._id,
            noOfAttempts: 0,
          },
          remainingAttempts: negotiationConfig.maxAttempts,
          remainingFreeAttempts: negotiationConfig.freeAttempts,
          oChargeForReTry: 10,
        },
        code: ERROR_CODES.SUCCESS,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer",
      error: null,
      data: {
        attempts,
        remainingAttempts:
          negotiationConfig.maxAttempts - attempts.noOfAttempts,
        remainingFreeAttempts:
          negotiationConfig.freeAttempts - attempts.noOfAttempts,
        oChargeForReTry: 10,
      },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Try to Attempt Offer", error.message, error);

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

export const getCollectedOffers = async (req: IRequest, res: Response) => {
  try {
    const collectedOffers = await Collected.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brands",
          pipeline: [
            {
              $project: {
                brandName: 1,
                brandLogo: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          brandDetails: {
            $first: "$brands",
          },
        },
      },
      {
        $lookup: {
          from: "ownerships",
          localField: "ownerships",
          foreignField: "_id",
          as: "ownerships",
          // pipeline: [
          //   {
          //     $lookup: {
          //       from: "ologs",
          //       localField: "transaction",
          //       foreignField: "_id",
          //       as: "logs",
          //     },
          //   },
          //   {
          //     $addFields: {
          //       earndO: {
          //         $first: "$logs.buyer.oQuantity",
          //       },
          //     },
          //   },
          // ],
        },
      },
      {
        $addFields: {
          ownershipDetails: {
            $first: "$ownerships",
          },
        },
      },
      // {
      //   $project: {
      //     brands: 0,
      //     ownerships: 0,
      //   },
      // },
      {
        $facet: {
          collectedOffers: [
            {
              $project: {
                brands: 0,
                ownerships: 0,
              },
            },
          ],
          totalOfferCount: [
            {
              $count: "offer",
            },
          ],
          totalInProgress: [
            {
              $unwind: "$ownerships",
            },
            {
              $unwind: "$ownerships.offer_access_codes",
            },
            {
              $match: {
                "ownerships.offer_access_codes.status": "collected",
              },
            },
            {
              $count: "totalInProgress",
            },
          ],
          totalOEarned: [
            {
              $unwind: "$ownerships",
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$ownerships.oEarned",
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalOEarned: "$total",
              },
            },
          ],
          totalSpent: [
            {
              $unwind: "$ownerships",
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$ownerships.spent",
                },
              },
            },
            {
              $project: {
                _id: 0,
                total: "$total",
              },
            },
          ],
        },
      },
      {
        $project: {
          collectedOffers: 1,
          totalOfferCount: {
            $first: "$totalOfferCount.offer",
          },
          totalInProgress: {
            $first: "$totalInProgress.totalInProgress",
          },
          totalOEarned: {
            $first: "$totalOEarned.totalOEarned",
          },
          totalSpent: {
            $first: "$totalSpent.total",
          },
        },
      },
    ]);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer",
      error: null,
      data: collectedOffers.length > 0 ? collectedOffers[0] : null,
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

export const getCollectedOfferDetails = async (
  req: IRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const collectedOffer = await Collected.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "offerdatas",
          localField: "offerDataId",
          foreignField: "_id",
          as: "offerDatas",
        },
      },
      {
        $addFields: {
          offerDataDetails: {
            $first: "$offerDatas",
          },
        },
      },
      {
        $lookup: {
          from: "ownerships",
          localField: "ownerships",
          foreignField: "_id",
          as: "ownerships",
          pipeline: [
            {
              $lookup: {
                from: "ologs",
                localField: "transactions",
                foreignField: "_id",
                as: "transactions",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          ownershipDetails: {
            $first: "$ownerships",
          },
        },
      },
      {
        $lookup: {
          from: "outlets",
          localField: "outlet",
          foreignField: "_id",
          as: "outlets",
        },
      },
      {
        $addFields: {
          outletDetails: {
            $first: "$outlets",
          },
        },
      },
      {
        $project: {
          offerDatas: 0,
          ownerships: 0,
          offerDataId: 0,
          ownership: 0,
        },
      },
    ]);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer",
      error: null,
      data: collectedOffer,
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

export const getCollectedOfferQr = async (req: IRequest, res: Response) => {
  try {
    const id = req.params.id;
    const collectedOffer = await Collected.findOne({ _id: id }).populate(
      "ownership"
    );
    if (!collectedOffer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Collected offer not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const status = collectedOffer?.ownerships?.offer_access_codes.find(
      (code: any) =>
        code.code === id && code.status === OFFER_COLLECTION_EVENTS.COLLECTED
    );

    if (!status) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "You don't have any pending delivery ",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const qrStr = JSON.stringify({
      id,
      user: req.user._id,
    });

    // const encryptedQrStr = encryptText(qrStr, "../../../keys/public.pem");

    const collectedOfferQR = await generateQR(qrStr);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer Qr",
      error: null,
      data: collectedOfferQR,
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

//TODO : not completed yet
export const reSellCollectedOffer = async (req: IRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { offerPriceAmount, offerPriceMinAmount, offerPriceMinPercentage } =
      req.body;
    const collectedOffer = await Collected.findOne({
      _id: id,
      user: req.user._id,
    }).populate("ownership");
    if (!collectedOffer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Invalid Collected Offer to resell",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }
    const status = collectedOffer?.ownerships?.offer_access_codes.find(
      (code: any) =>
        code.code === id && code.status === OFFER_COLLECTION_EVENTS.COLLECTED
    );
    if (!status) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "This offer already delivered",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const offerDataId = collectedOffer?.offerDataId;
    const offer = collectedOffer.offer;

    const offerData = await OfferData.findById(offerDataId);
    const offerObj = await Offer.findById(offer);
    if (!offerData || !offerObj) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Invalid Offer to resell",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    delete offerData._id;
    const newOfferData = new OfferData({
      ...offerData,
      offerPriceAmount,
      offerPriceMinAmount,
      offerPriceMinPercentage,
      type: OFFER_TYPE.RESELL,
    });

    await newOfferData.save();

    delete offerObj._id;

    const newOffer = new Offer({
      ...offerObj,
      user: req.user._id,
      offerType: OFFER_TYPE.RESELL,
    });

    await newOffer.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer Successfully added for ",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Resell Collected Offer", error.message, error);
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
