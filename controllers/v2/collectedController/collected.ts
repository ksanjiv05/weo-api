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
import User from "../../../models_v1/User";
import { updateWallet } from "../../../helper/user";

// define function for create Collected

export const collectOffer = async (req: IRequest, res: Response) => {
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
    offerType = OFFER_TYPE.FRESH,
    negotiation = true,
  } = req.body;
  const uid = req.user._id;
  const session = await Collected.startSession();
  session.startTransaction();
  try {
    offerStatusOffed();

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

    const deductOBalance =
      negotiationAttemptInstance &&
      negotiationAttemptInstance.noOfAttempts > negotiationConfig.freeAttempts
        ? negotiationConfig.oCharge
        : negotiation
        ? negotiationConfig.oCharge
        : 0;

    if (deductOBalance > 0) {
      console.log("deductOBalance", deductOBalance);
      if (wallet.oBalance < deductOBalance) {
        return responseObj({
          resObj: res,
          type: "error",
          statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
          msg: "Insufficient O Balance",
          error: "Insufficient O Balance",
          data: {
            remainingAttempts: negotiationAttemptInstance
              ? negotiationConfig.maxAttempts -
                negotiationAttemptInstance?.noOfAttempts
              : negotiationConfig.maxAttempts,
          },
          code: ERROR_CODES.FIELD_VALIDATION_ERR,
        });
      }
      wallet.oBalance = wallet.oBalance - deductOBalance;
      // await wallet.save();
      await updateWallet(wallet, req.user._id);
      const newOLogForONegotiation = new oLogModel({
        // event: O_EVENTS.COLLECTED,
        amount: 0,
        offer: id,
        brand: null,
        seller: null,
        outlet: null,
        buyer: {
          id: req.user._id,
          oQuantity: deductOBalance,
          event: O_EVENTS.NEGOTIATION_ATTEMPT,
        },
        discount: 0,
        quantity: 0,
        noOfOffers: 0,
        oAgainstPrice: 0,
        oGenerated: 0,
        atPlatformCutOffRate: 0,
        atRateCutOffFromDiscount: 0,
        toPlatformCutOffRateFromDiscount: 0,
        toPlatformCutOffRate: 0,
      });

      await newOLogForONegotiation.save();
    }

    const offer = await Offer.findOne({
      _id: id,
      offerStatus: OFFER_STATUS.LIVE,
      totalOffersAvailable: { $gte: noOfOffers },
    });

    console.log("offer which going to collect ", offer);
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

    if (offer.user.toString() == req.user._id.toString()) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "You cannot collect your own offer",
        error: "You cannot collect your own offer",
        data: {
          remainingAttempts: negotiationAttemptInstance
            ? negotiationConfig.maxAttempts -
              negotiationAttemptInstance?.noOfAttempts
            : negotiationConfig.maxAttempts,
        },
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }

    const offerDataPoint: IOfferData | null = await OfferData.findOne({
      _id: offerDataId,
      minimumOfferUnitItem: { $lte: quantity },
    });

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

    console.log(
      "serviceDays",
      serviceDays,
      "--",
      serviceEndDate,
      serviceStartDate,
      "con",
      serviceDays >= duration,
      offerValueAfterDiscount >= amount,
      offerValueAfterDiscount,
      amount
    );

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

    const newOfferCollected = new Collected({
      offer: id,
      brand: offer.brand,
      user: req.user._id,
      offerDataId: offerDataId,
      offerName: offer.offerName,
      offerThumbnail: offer.offerThumbnail,
      outlet: outletId,
    });

    offer.totalOffersAvailable = offer.totalOffersAvailable - noOfOffers;
    offer.totalOfferSold = offer.totalOfferSold + noOfOffers;

    console.log(
      "newOfferCollected+++++",
      wallet.balance,
      amount,
      noOfOffers,
      100,
      wallet.balance < amount * noOfOffers * 100
    );

    if (wallet.balance < amount * noOfOffers) {
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
    //
    wallet.balance = wallet.balance - amount * noOfOffers;
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
    const { toDistribute, totalO } = oGenerate({
      amount: amountAfterExchange,
      discount: offerDataPoint.offerPriceMinPercentage,
      oNetworkConfig,
    });

    // update
    req.user.oEarned = req.user.oEarned + toDistribute / 2;
    req.user.oEarnPotential = req.user.oEarnPotential + toDistribute / 2;

    const sellerWallet = await Wallet.findOne({
      user: offerType === OFFER_TYPE.RESELL ? offer.reSeller : offer.user,
    });

    if (!sellerWallet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "seller wallet not found",
        error: "seller wallet not found",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }

    sellerWallet.oBalance = sellerWallet.oBalance + toDistribute / 2;
    console.log("_______toDistribute_____after collect________");
    console.log({
      exchangeRate,
      amountAfterExchange,
      toDistribute,
      totalO,
    });

    wallet.oBalance = wallet.oBalance + toDistribute / 2;

    const newOLog = new oLogModel({
      // event: O_EVENTS.COLLECTED,
      amount: amount * noOfOffers,
      offer: id,
      brand: offer.brand,
      outlet: outletId,
      seller: {
        id: offerType === OFFER_TYPE.RESELL ? offer.reSeller : offer.user,
        oQuantity: toDistribute / 2,
        event: O_EVENTS.SOLD,
      },
      buyer: {
        id: req.user._id,
        oQuantity: toDistribute / 2,
        event: O_EVENTS.COLLECTED,
      },
      discount: offerDataPoint.offerPriceMinPercentage,
      quantity,
      noOfOffers: noOfOffers,
      oAgainstPrice: oNetworkConfig.oAgainstPrice,
      oGenerated: totalO,
      atPlatformCutOffRate: oNetworkConfig.atPlatformCutOffRate,
      atRateCutOffFromDiscount: oNetworkConfig.atRateCutOffFromDiscount,
      toPlatformCutOffRateFromDiscount:
        oNetworkConfig.toPlatformCutOffRateFromDiscount,
      toPlatformCutOffRate: oNetworkConfig.toPlatformCutOffRate,
    });

    let newOwnerShip = new Ownership({
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

    if (offerType === OFFER_TYPE.RESELL) {
      // const originalCreatorListed = await listedModel.findOne({
      //   offer:offer.reSoldOfferId
      // })

      // originalCreatorListed?.ownerships
      const collectObj = await Collected.findOne({
        offer: offer.reSoldOfferId,
        user: offer.reSeller,
      });
      console.log("-----", { collectObj });

      const ownershipObj = await Ownership.findOne({
        _id: collectObj?.ownership,
      });
      if (!ownershipObj) {
        return responseObj({
          resObj: res,
          type: "error",
          statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
          msg: "you are not owner of this offer",
          error: "you are not owner of this offer",
          data: null,
          code: ERROR_CODES.FIELD_VALIDATION_ERR,
        });
      }

      const owners = ownershipObj?.owner.map((owner: any) => {
        owner.isCurrentOwner = false;
        return owner;
      });

      ownershipObj.owner = [
        ...owners,
        {
          ownerId: req.user._id,
          isCurrentOwner: true,
        },
      ];
      await ownershipObj.save({ session });

      await listedModel.updateOne(
        { offer: id },
        {
          $addToSet: {
            ownerships: newOwnerShip._id,
          },
        },
        {
          session,
        }
      );

      newOfferCollected.ownership = newOwnerShip._id;
      await newOwnerShip.save({ session });
      console.log("--0--");
      console.log("--1--");

      // await wallet.save({ session });
      await updateWallet(wallet, req.user._id);
      await sellerWallet.save({ session });
      console.log("--2--");

      await newOfferCollected.save({ session });
      console.log("--3--");
      await newOLog.save({ session });
      console.log("--4--");
      await offer.save({ session });
      await req.user.save({ session });
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
    } else {
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

      newOfferCollected.ownership = newOwnerShip._id;
      await newOwnerShip.save({ session });
      console.log("--0--");
      console.log("--1--");

      // await wallet.save({ session });
      await updateWallet(wallet, req.user._id);

      await sellerWallet.save({ session });

      console.log("--2--");

      await newOfferCollected.save({ session });
      console.log("--3--");
      await newOLog.save({ session });
      console.log("--4--");
      await offer.save({ session });
      await req.user.save({ session });
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
    }
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
    const { isReSellable = false } = req.query;
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
          localField: "ownership",
          foreignField: "_id",
          as: "ownership",
        },
      },

      {
        $unwind: "$ownership",
      },
      {
        $unwind: "$ownership.owner",
      },
      {
        $match: {
          $and: [
            {
              "ownership.owner.ownerId": new mongoose.Types.ObjectId(
                req.user._id
              ),
            },
            { "ownership.owner.isCurrentOwner": true },
          ],
        },
      },

      {
        $lookup: {
          from: "offerdatas",
          localField: "offerDataId",
          foreignField: "_id",
          as: "offerDataDetils",
          pipeline: [
            {
              $project: {
                serviceStartDate: 1,
                serviceStartTime: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          offerDataDetils: {
            $first: "$offerDataDetils",
          },
        },
      },
      // {
      //   $addFields: {
      //     ownership: {
      //       $first: "$ownership",
      //     },
      //   },
      // },
      {
        $addFields: {
          reSellable: {
            $cond: [
              {
                $and: [
                  {
                    $gt: ["$offerDataDetils.serviceStartDate", new Date()],
                  },
                ],
              },
              true,
              false,
            ],
          },
        },
      },
      {
        $facet: {
          // collectedOffers: [...(isReSellable ? reSellableFilter : [])],
          collectedOffers: [],
          totalOfferCount: [
            {
              $count: "offer",
            },
          ],
          totalInProgress: [
            {
              $unwind: "$ownership.offer_access_codes",
            },
            {
              $match: {
                "ownership.offer_access_codes.status": 2,
              },
            },
            {
              $count: "totalInProgress",
            },
          ],
          totalOEarned: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$ownership.oEarned",
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
              $unwind: "$ownership",
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$ownership.spent",
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

    // const reSellableFilter = [
    //   {
    //     $match: {
    //       "ownership.offer_access_codes.status":
    //         OFFER_COLLECTION_EVENTS.COLLECTED,
    //     },
    //   },
    //   {
    //     $match: {
    //       reSellable: true,
    //     },
    //   },
    // ];

    // const collectedOffers = await Collected.aggregate([
    //   {
    //     $match: {
    //       user: new mongoose.Types.ObjectId(req.user._id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "offers",
    //       localField: "offer",
    //       foreignField: "_id",
    //       as: "offer",
    //       // pipeline: [
    //       //   {
    //       //     $lookup: {
    //       //       from: "offers",
    //       //       localField: "_id",
    //       //       foreignField: "reSoldOfferId",
    //       //       as: "offers",
    //       //     },
    //       //   },
    //       //   {
    //       //     $unwind: "$offers",
    //       //   },
    //       //   {
    //       //     $match: {
    //       //       // "offers.offerType": OFFER_TYPE.RESELL,
    //       //       "offers.offerType": { $ne: OFFER_TYPE.RESELL },
    //       //     },
    //       //   },
    //       // ],
    //     },
    //   },
    //   {
    //     $unwind: "$offer",
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       localField: "brand",
    //       foreignField: "_id",
    //       as: "brands",
    //       pipeline: [
    //         {
    //           $project: {
    //             brandName: 1,
    //             brandLogo: 1,
    //           },
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $addFields: {
    //       brandDetails: {
    //         $first: "$brands",
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "ownerships",
    //       localField: "ownership",
    //       foreignField: "_id",
    //       as: "ownership",
    //     },
    //   },

    //   // {
    //   //   $lookup: {
    //   //     from: "offers",
    //   //     localField: "offer",
    //   //     foreignField: "_id",
    //   //     as: "offer",
    //   //     pipeline: []
    //   //   },
    //   // },
    //   // {
    //   //   $addFields: {
    //   //     offer: {
    //   //       $first: "$offer",
    //   //     },
    //   //   },
    //   // },

    //   {
    //     $lookup: {
    //       from: "offerdatas",
    //       localField: "offerDataId",
    //       foreignField: "_id",
    //       as: "offerDataDetils",
    //       pipeline: [
    //         {
    //           $project: {
    //             serviceStartDate: 1,
    //             serviceStartTime: 1,
    //           },
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $addFields: {
    //       offerDataDetils: {
    //         $first: "$offerDataDetils",
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       ownership: {
    //         $first: "$ownership",
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       reSellable: {
    //         $cond: [
    //           {
    //             $and: [
    //               {
    //                 $gt: ["$offerDataDetils.serviceStartDate", new Date()],
    //               },
    //             ],
    //           },
    //           true,
    //           false,
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     $facet: {
    //       collectedOffers: [...(isReSellable ? reSellableFilter : [])],
    //       totalOfferCount: [
    //         {
    //           $count: "offer",
    //         },
    //       ],
    //       totalInProgress: [
    //         {
    //           $unwind: "$ownership.offer_access_codes",
    //         },
    //         {
    //           $match: {
    //             "ownership.offer_access_codes.status":
    //               OFFER_COLLECTION_EVENTS.COLLECTED,
    //           },
    //         },
    //         {
    //           $count: "totalInProgress",
    //         },
    //       ],
    //       totalOEarned: [
    //         {
    //           $group: {
    //             _id: null,
    //             total: {
    //               $sum: "$ownership.oEarned",
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 0,
    //             totalOEarned: "$total",
    //           },
    //         },
    //       ],
    //       totalSpent: [
    //         {
    //           $unwind: "$ownership",
    //         },
    //         {
    //           $group: {
    //             _id: null,
    //             total: {
    //               $sum: "$ownership.spent",
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 0,
    //             total: "$total",
    //           },
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $project: {
    //       collectedOffers: 1,
    //       totalOfferCount: {
    //         $first: "$totalOfferCount.offer",
    //       },
    //       totalInProgress: {
    //         $first: "$totalInProgress.totalInProgress",
    //       },
    //       totalOEarned: {
    //         $first: "$totalOEarned.totalOEarned",
    //       },
    //       totalSpent: {
    //         $first: "$totalSpent.total",
    //       },
    //     },
    //   },
    // ]);
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
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
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
          localField: "ownership",
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
          offer: {
            $first: "$offer",
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

    console.log("---", collectedOffer);

    const status = collectedOffer?.ownership?.offer_access_codes.find(
      (code: any) =>
        code.code === id &&
        parseInt(code.status) === OFFER_COLLECTION_EVENTS.COLLECTED
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

export const reSellCollectedOffer = async (req: IRequest, res: Response) => {
  const session = await Collected.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    console.log("id", id, req.user._id);
    const { offerPriceAmount, offerPriceMinPercentage } = req.body;
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
    //TODO : if service date is started then offer can not be resold
    // const status = collectedOffer?.ownership?.offer_access_codes.find(
    //   (code: any) =>
    //     code.code === id && code.status === OFFER_COLLECTION_EVENTS.COLLECTED
    // );
    const offerData = await OfferData.findOne({
      _id: collectedOffer.offerDataId,
      serviceStartDate: {
        $gt: new Date(),
      },
    });

    if (!offerData) {
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

    const offer = collectedOffer.offer;
    const offerObj = await Offer.findOne({ _id: offer });
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

    const offerDataJson = offerData.toJSON();
    delete offerDataJson._id;
    const newOfferData = new OfferData({
      ...offerDataJson,
      offerPriceAmount,
      offerPriceMinPercentage,
      type: OFFER_TYPE.RESELL,
    });

    await newOfferData.save({ session });
    const offerId = offerObj._id;
    const offerObjJson = offerObj.toJSON();
    delete offerObjJson._id;

    const newOffer = new Offer({
      ...offerObjJson,
      offerType: OFFER_TYPE.RESELL,
      reSeller: req.user._id,
      totalOffersAvailable: 1,
      totalOfferSold: 0,
      offerStatus: OFFER_STATUS.RESELL,
      reSoldOfferId: offerId,
      offerDataPoints: [
        {
          offerData: newOfferData._id,
        },
      ],
    });

    await newOffer.save({ session });

    const newOfferListed = new listedModel({
      user: req.user._id,
      offer: offer._id,
      brand: offer.brand,
      ownerships: [],
    });

    await newOfferListed.save({ session });

    await session.commitTransaction();
    await session.endSession();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer Successfully added for resell ",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
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

const offerStatusOffed = async () => {
  try {
    await Offer.updateMany(
      { totalOffersAvailable: 0 },
      { offerStatus: OFFER_STATUS.SOLD }
    );
  } catch (error) {
    console.log("offer status update failed", error);
  }
};

export const getReSoldCollectedOffers = async (
  req: IRequest,
  res: Response
) => {
  try {
    console.log(
      "_______________________getReSoldCollectedOffers____________________________"
    );
    const { isReSellable = false } = req.query;
    const reSellableFilter = [
      {
        $match: {
          "ownership.offer_access_codes.status":
            OFFER_COLLECTION_EVENTS.COLLECTED,
        },
      },
      {
        $match: {
          reSellable: true,
        },
      },
    ];
    console.log("reSellable filter", req.user._id);

    const collectedOffers = await Collected.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "reSoldOfferId",
          as: "offer",
          pipeline: [
            {
              $match: {
                offerType: "resell",
                reSeller: req.user._id,
              },
            },
          ],
        },
      },
      {
        $unwind: "$offer",
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
          localField: "ownership",
          foreignField: "_id",
          as: "ownership",
        },
      },

      {
        $lookup: {
          from: "offerdatas",
          localField: "offerDataId",
          foreignField: "_id",
          as: "offerDataDetils",
          pipeline: [
            {
              $project: {
                serviceStartDate: 1,
                serviceStartTime: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          offerDataDetils: {
            $first: "$offerDataDetils",
          },
        },
      },
      {
        $addFields: {
          ownership: {
            $first: "$ownership",
          },
        },
      },
      {
        $addFields: {
          reSellable: {
            $cond: [
              {
                $and: [
                  {
                    $gt: ["$offerDataDetils.serviceStartDate", new Date()],
                  },
                ],
              },
              true,
              false,
            ],
          },
        },
      },
      {
        $facet: {
          collectedOffers: [...(isReSellable ? reSellableFilter : [])],
          totalOfferCount: [
            {
              $count: "offer",
            },
          ],
          totalInProgress: [
            {
              $unwind: "$ownership.offer_access_codes",
            },
            {
              $match: {
                "ownership.offer_access_codes.status":
                  OFFER_COLLECTION_EVENTS.COLLECTED,
              },
            },
            {
              $count: "totalInProgress",
            },
          ],
          totalOEarned: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$ownership.oEarned",
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
              $unwind: "$ownership",
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$ownership.spent",
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
    logging.error("GET REsell Collected Offer", error.message, error);
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

// export const reSellCollectedOffer = async (req: IRequest, res: Response) => {
//   const session = await Collected.startSession();
//   session.startTransaction();
//   try {
//     const id = req.params.id;
//     console.log("id", id, req.user._id);
//     const { offerPriceAmount, offerPriceMinPercentage } = req.body;
//     const collectedOffer = await Collected.findOne({
//       _id: id,
//       user: req.user._id,
//     }).populate("ownership");
//     if (!collectedOffer) {
//       return responseObj({
//         resObj: res,
//         type: "error",
//         statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
//         msg: "Invalid Collected Offer to resell",
//         error: null,
//         data: null,
//         code: ERROR_CODES.NOT_FOUND,
//       });
//     }
//     //TODO : if service date is started then offer can not be resold
//     // const status = collectedOffer?.ownership?.offer_access_codes.find(
//     //   (code: any) =>
//     //     code.code === id && code.status === OFFER_COLLECTION_EVENTS.COLLECTED
//     // );
//     const offerData = await OfferData.findOne({
//       _id: collectedOffer.offerDataId,
//       serviceStartDate: {
//         $gt: new Date(),
//       },
//     });

//     if (!offerData) {
//       return responseObj({
//         resObj: res,
//         type: "error",
//         statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
//         msg: "This offer already delivered",
//         error: null,
//         data: null,
//         code: ERROR_CODES.NOT_FOUND,
//       });
//     }

//     const offer = collectedOffer.offer;
//     const offerObj = await Offer.findOne({ _id: offer });
//     if (!offerData || !offerObj) {
//       return responseObj({
//         resObj: res,
//         type: "error",
//         statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
//         msg: "Invalid Offer to resell",
//         error: null,
//         data: null,
//         code: ERROR_CODES.NOT_FOUND,
//       });
//     }

//     const offerDataJson = offerData.toJSON();
//     delete offerDataJson._id;
//     const newOfferData = new OfferData({
//       ...offerDataJson,
//       offerPriceAmount,
//       offerPriceMinPercentage,
//       type: OFFER_TYPE.RESELL,
//     });

//     await newOfferData.save({ session });
//     const offerId = offerObj._id;
//     const offerObjJson = offerObj.toJSON();
//     delete offerObjJson._id;

//     const newOffer = new Offer({
//       ...offerObjJson,
//       offerType: OFFER_TYPE.RESELL,
//       reSeller: req.user._id,
//       totalOffersAvailable: 1,
//       totalOfferSold: 0,
//       offerStatus: OFFER_STATUS.LIVE,
//       reSoldOfferId: offerId,
//       offerDataPoints: [
//         {
//           offerData: newOfferData._id,
//         },
//       ],
//     });

//     await newOffer.save({ session });

//     const newOfferListed = new listedModel({
//       user: req.user._id,
//       offer: offer._id,
//       brand: offer.brand,
//       ownerships: [],
//     });

//     await newOfferListed.save({ session });

//     await session.commitTransaction();
//     await session.endSession();
//     return responseObj({
//       resObj: res,
//       type: "success",
//       statusCode: HTTP_STATUS_CODES.SUCCESS,
//       msg: "Collected Offer Successfully added for resell ",
//       error: null,
//       data: null,
//       code: ERROR_CODES.SUCCESS,
//     });
//   } catch (error: any) {
//     await session.abortTransaction();
//     await session.endSession();
//     logging.error("Resell Collected Offer", error.message, error);
//     return responseObj({
//       resObj: res,
//       type: "error",
//       statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       msg: "Internal server error",
//       error: error.message ? error.message : "internal server error",
//       data: null,
//       code: ERROR_CODES.SERVER_ERR,
//     });
//   }
// };
