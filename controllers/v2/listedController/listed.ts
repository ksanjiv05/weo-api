// Objective : define the listed controller for the v2 API
//Author: sanjiv kumar pandit

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Listed, { IListed } from "../../../models/listed.model";
import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import Offer from "../../../models/offer.model";
import Outlet from "../../../models/outlet.model";
import Brand from "../../../models/brand.model";
import mongoose from "mongoose";

// define function for create listed
//TODO: created listed logic not implemented yet
export const createListed = async (req: Request, res: Response) => {
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
    const newOfferListed = new Listed(req.body);
    newOfferListed.offer = id;
    await newOfferListed.save();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Offer Listed",
      error: null,
      data: newOfferListed,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Listed Offer", error.message, error);

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

// define function for get listed offer

export const getListedOffers = async (req: Request, res: Response) => {
  try {
    //add filter for listed offer by nearby outlet
    const { brandId } = req.params;

    const offers = await Offer.find({ brand: brandId }).populate(
      "offerDataPoints"
    );

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: offers,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Listed Offer", error.message, error);
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

export const getAllListedBrands = async (req: Request, res: Response) => {
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
              //   $subtract: ["$offers.totalListed", "$offers.sold"],
              // },
              // completed: "$offers.sold",
              // listed: "$offers.totalListed",
              // pending: {
              //   $subtract: ["$offers.totalListed", "$offers.sold"],
              // },
              completed: "$completed",
              listed: { $size: "$offers" },
              // listed: "$offers.totalListed",
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
