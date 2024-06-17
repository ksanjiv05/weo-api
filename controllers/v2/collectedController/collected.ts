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

// define function for create Collected
//TODO: created Collected logic not implemented yet
export const createCollected = async (req: Request, res: Response) => {
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

  const { id } = req.params;
  const offer = await Offer.findById(id);
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

  try {
    const newOfferCollected = new Collected(req.body);
    newOfferCollected.offer = id;
    await newOfferCollected.save();
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
