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

          eventWise: [
            {
              $group: {
                _id: "$buyer.event",
                total: {
                  $sum: "$buyer.oQuantity",
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

export const getTransactionHistory = async (req: IRequest, res: Response) => {
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
      data: oHistory.length > 0 ? oHistory[0] : null,
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
    const { fromDate = new Date(), toDate = new Date() } = req.body;
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
          transactions: [
            {
              $match: {
                $and: [
                  {
                    createdAt: {
                      $gte: new Date(fromDate),
                    },
                  },
                  {
                    createdAt: {
                      $lte: new Date(toDate),
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
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "graph data",
      error: null,
      data: gData,
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
