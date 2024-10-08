import { Request, Response } from "express";
import { getOConfig, oGenerate } from "../../../helper/oCalculator/v2";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import logging from "../../../config/logging";
import { getExchangeRate } from "../../../helper/exchangeRate";
import { BASE_CURRENCY } from "../../../config/config";
import { IRequest } from "../../../interfaces/IRequest";
import oLogModel from "../../../models/oLog.model";
import mongoose from "mongoose";
import walletModel from "../../../models/wallet.model";
import User from "../../../models_v1/User";
import { O_EVENTS } from "../../../config/enums";

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

export const getOHistory = async (req: IRequest, res: Response) => {
  try {
    const { _id = "" } = req.user;

    const oHistory = await oLogModel.aggregate([
      {
        $match: {
          $or: [
            {
              "seller.id": new mongoose.Types.ObjectId(_id),
            },
            {
              "buyer.id": new mongoose.Types.ObjectId(_id),
            },
          ],
        },
      },
      {
        $addFields: {
          user: {
            $cond: {
              if: { $eq: ["$seller.id", new mongoose.Types.ObjectId(_id)] },
              then: "$seller",
              else: "$buyer",
            },
          },
        },
      },
      {
        $project: {
          oPriceRate: 0,
          oAgainstPrice: 0,
          event: 0,
          oGenerated: 0,
          atPlatformCutOffRate: 0,
          atRateCutOffFromDiscount: 0,
          toPlatformCutOffRateFromDiscount: 0,
          toPlatformCutOffRate: 0,
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
          pipeline: [
            {
              $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      creatorName: 1,
                    },
                  },
                ],
              },
            },

            {
              $lookup: {
                from: "offerdatas",
                localField: "offerDataPoints.offerData",
                foreignField: "_id",
                as: "offerDataPoints",
              },
            },
            {
              $addFields: {
                offerDataDetails: {
                  $first: "$offerDataPoints",
                },
                brand: {
                  $first: "$brand",
                },
                user: {
                  $first: "$user",
                },
              },
            },
            {
              $project: {
                offerDataPoints: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          offer: {
            $first: "$offer",
          },
        },
      },
      {
        $facet: {
          oHistory: [],

          // eventWise: [
          //   {
          //     $group: {
          //       _id: "$user.event",
          //       total: {
          //         $sum: "$user.oQuantity",
          //       },
          //     },
          //   },
          // ],
          eventWise: [
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $in: ["$user.event", [1, 2]],
                        },
                        then: "earn", // Group for eventType1 and eventType2
                      },
                      {
                        case: {
                          $in: ["$user.event", [3]],
                        },
                        then: "topup", // Group for eventType3 and eventType4
                      },
                    ],
                    default: "spent", // All other event types in a separate group
                  },
                },
                total: {
                  $sum: "$user.oQuantity",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          oHistory: 1,
          eventWise: 1,
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "your o history",
      error: null,
      data: oHistory.length > 0 ? oHistory[0] : null,
      // oHistory.length > 0
      //   ? {
      //       oHistory: oHistory[0].oHistory,
      //       stats: {
      //         earn: oHistory[0].earn,
      //       },
      //     }
      //   : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("oHistory", error.message, error);
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
//TODO need to add add negotiation event
//TODO all data should be brand wise
export const getTransactionHistory = async (req: IRequest, res: Response) => {
  try {
    const { _id = "" } = req.user;

    const transactions = await oLogModel.aggregate([
      {
        $match: {
          $or: [
            {
              "seller.id": new mongoose.Types.ObjectId(_id),
            },
            {
              "buyer.id": new mongoose.Types.ObjectId(_id),
            },
          ],
        },
      },
      {
        $addFields: {
          user: {
            $cond: {
              if: { $eq: ["$seller.id", new mongoose.Types.ObjectId(_id)] },
              then: "$seller",
              else: "$buyer",
            },
          },
        },
      },
      {
        $project: {
          oPriceRate: 0,
          oAgainstPrice: 0,
          event: 0,
          oGenerated: 0,
          atPlatformCutOffRate: 0,
          atRateCutOffFromDiscount: 0,
          toPlatformCutOffRateFromDiscount: 0,
          toPlatformCutOffRate: 0,
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
          pipeline: [
            {
              $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      creatorName: 1,
                    },
                  },
                ],
              },
            },

            {
              $lookup: {
                from: "offerdatas",
                localField: "offerDataPoints.offerData",
                foreignField: "_id",
                as: "offerDataPoints",
              },
            },
            {
              $addFields: {
                offerDataDetails: {
                  $first: "$offerDataPoints",
                },
                brand: {
                  $first: "$brand",
                },
                user: {
                  $first: "$user",
                },
              },
            },
            {
              $project: {
                offerDataPoints: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          offer: {
            $first: "$offer",
          },
          user: "$buyer",
        },
      },
      {
        $facet: {
          transactions: [],

          totalOAsSeller: [
            {
              $match: {
                "seller.id": new mongoose.Types.ObjectId(_id),
              },
            },
            {
              $group: {
                _id: "$seller.id",
                total: {
                  $sum: "$seller.oQuantity",
                },
                amount: {
                  $sum: "$amount",
                },
              },
            },
          ],
          totalOAsBuyer: [
            {
              $match: {
                "buyer.id": new mongoose.Types.ObjectId(_id),
              },
            },
            {
              $group: {
                _id: "$buyer.id",
                total: {
                  $sum: "$buyer.oQuantity",
                },
                amount: {
                  $sum: "$amount",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          transactions: 1,

          totalOAsSeller: {
            $first: "$totalOAsSeller",
          },
          totalOAsBuyer: {
            $first: "$totalOAsBuyer",
          },
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "your o history",
      error: null,
      data:
        transactions.length > 0
          ? {
              transactions: transactions[0].transactions,
              oSpent: transactions[0].totalOAsSeller,
              oEarn: transactions[0].totalOAsBuyer,
            }
          : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("oHistory", error.message, error);
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

export const myWalletDetails = async (req: IRequest, res: Response) => {
  try {
    const { _id = "" } = req.user;

    const wallet = await walletModel.findOne({ user: _id });
    if (!wallet) {
      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "wallet not found",
        error: null,
        data: null,
        code: ERROR_CODES.SUCCESS,
      });
    }
    const oBalance = wallet?.oBalance || 0;

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "your wallet details",
      error: null,
      data: { wallet, oBalanceValue: oBalance / wallet?.oRate },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("My Wallet", error.message, error);
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

export const getGraphData = async (req: IRequest, res: Response) => {
  try {
    const { _id = "" } = req.user;
    const { from = new Date(), to = new Date() }: any = req.query;
    console.log(from, to, new Date(parseInt(from)), new Date(parseInt(to)));
    const gData = await oLogModel.aggregate([
      {
        $match: {
          $or: [
            {
              "seller.id": new mongoose.Types.ObjectId(_id),
            },
            {
              "buyer.id": new mongoose.Types.ObjectId(_id),
            },
          ],
        },
      },
      {
        $addFields: {
          user: {
            $cond: {
              if: { $eq: ["$seller.id", new mongoose.Types.ObjectId(_id)] },
              then: "$seller",
              else: "$buyer",
            },
          },
        },
      },
      {
        $project: {
          oPriceRate: 0,
          oAgainstPrice: 0,
          event: 0,
          oGenerated: 0,
          atPlatformCutOffRate: 0,
          atRateCutOffFromDiscount: 0,
          toPlatformCutOffRateFromDiscount: 0,
          toPlatformCutOffRate: 0,
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
          pipeline: [
            {
              $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $addFields: {
                brand: {
                  $first: "$brand",
                },
              },
            },
            {
              $lookup: {
                from: "offerdatas",
                localField: "offerDataPoints.offerData",
                foreignField: "_id",
                as: "offerDataPoints",
              },
            },
            {
              $addFields: {
                offerDataDetails: {
                  $first: "$offerDataPoints",
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          offer: {
            $first: "$offer",
          },
        },
      },
      {
        $facet: {
          events: [
            {
              $group: {
                _id: "$user.event",
                count: {
                  $sum: 1,
                },
              },
            },
          ],
          cards: [
            {
              $match: {
                $and: [
                  {
                    createdAt: {
                      $gte: new Date(parseInt(from)),
                    },
                  },
                  {
                    createdAt: {
                      $lte: new Date(parseInt(to)),
                    },
                  },
                ],
              },
            },
          ],
          transactions: [
            {
              $match: {
                $and: [
                  {
                    createdAt: {
                      $gte: new Date(parseInt(from)),
                    },
                  },
                  {
                    createdAt: {
                      $lte: new Date(parseInt(to)),
                    },
                  },
                ],
              },
            },
            {
              $project: {
                amount: 1,
                o: "$user.oQuantity",
                createdAt: 1,
              },
            },
          ],
          totalTransactionValue: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$amount",
                },
                totalO: {
                  $sum: "$user.oQuantity",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          transactions: 1,
          events: 1,
          totalTransactionStat: {
            $first: "$totalTransactionValue",
          },
          cards: 1,
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "graph data",
      error: null,
      data: gData.length > 0 ? gData[0] : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("My O Graph and history", error.message, error);
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

export const oTupUp = async (req: IRequest, res: Response) => {
  const session = await walletModel.startSession();
  session.startTransaction();
  try {
    const { oAmount } = req.body;
    const { user } = req;

    const wallet = await walletModel.findOne({ user: user._id });

    if (!wallet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Wallet not found",
        error: "Wallet not found",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }

    const oConfig = await getOConfig();
    if (!oConfig) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Internal server error",
        error: "O Config not found",
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    const userRate =
      user.oEarned === user.oEarnPotential
        ? 1
        : user.oEarned / user.oEarnPotential;

    const oPriceRate = oConfig.networkRate + (oConfig.networkRate - userRate);

    const oPrice = Math.ceil((oAmount * oPriceRate) / oConfig.oAgainstPrice);
    console.log(
      "----o top up oprice and price rate",
      oPrice,
      oPriceRate,
      oConfig.oAgainstPrice
    );
    const exchangeRate = await getExchangeRate(
      BASE_CURRENCY,
      req.user.currency
    );

    const amountAfterExchange = oPrice * exchangeRate;

    if (amountAfterExchange > wallet.balance) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Insufficient balance",
        error: "Insufficient balance",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }

    wallet.balance = wallet.balance - amountAfterExchange;
    wallet.oBalance = wallet.oBalance + parseFloat(oAmount);
    await wallet.save({ session });

    const newOLogForONegotiation = new oLogModel({
      // event: O_EVENTS.COLLECTED,
      amount: amountAfterExchange,
      offer: null,
      brand: null,
      seller: null,
      outlet: null,
      buyer: {
        id: req.user._id,
        oQuantity: oAmount,
        event: O_EVENTS.TOP_UP,
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

    await newOLogForONegotiation.save({ session });

    await session.commitTransaction();
    await session.endSession();

    responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "O Tup Up",
      error: null,
      data: {
        oPriceInUsd: oPrice,
        price: amountAfterExchange,
        totalO: oAmount,
        exchangeRate,
      },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    logging.error("O Tup Up Error", error.message, error);
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

export const getOConfigAndExchangeRate = async (
  req: IRequest,
  res: Response
) => {
  try {
    const { user } = req;
    const oConfig = await getOConfig();
    if (!oConfig) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Internal server error",
        error: "O Config not found",
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }
    const exchangeRate = await getExchangeRate(
      BASE_CURRENCY,
      req.user.currency
    );

    console.log("----o top up exchange rate", exchangeRate);

    const userSuccessRate =
      user.oEarned === user.oEarnPotential
        ? 1
        : user.oEarned / user.oEarnPotential;

    responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "here is your o config and exchange rate",
      error: null,
      data: {
        oConfig,
        exchangeRate,
        userSuccessRate,
        userORate: userSuccessRate,
      },
    });
  } catch (error: any) {
    logging.error("Get O config and Exchange Rate Error", error.message, error);
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
// total potential o
// total reward he earned

//search in transaction and collect list
