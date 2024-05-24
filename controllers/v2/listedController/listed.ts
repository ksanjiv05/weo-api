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
    const { latitude, longitude } = req.query;
    const userLocation = {
      type: "Point",
      coordinates: [longitude, latitude], // longitude, latitude
    };
    const brands = await Brand.aggregate([
      {
        $unwind: "$outlets", // Decompose the outlets array
      },
      {
        $match: {
          "outlets.address.location": {
            $nearSphere: {
              $geometry: userLocation,
              $maxDistance: 10000, // distance in meters, 10 km
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id", // Group back by brand ID
          brandName: { $first: "$brandName" }, // Retain the brand name
          outlets: { $push: "$outlets" }, // Aggregate the filtered outlets
        },
      },
    ]);

    const listed = await Listed.find({
      offer: {
        $in: brands
          .map((brand: any) =>
            brand.outlets.map((outlet: any) => outlet.offers)
          )
          .flat(),
      },
    }).populate({
      path: "offer",
      populate: {
        path: "brand",
        select: "brandName",
      },
    });
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: listed,
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
    const brands = await Brand.find({ user: user._id });
    // const result = await Offer.aggregate([
    //   // Match offers associated with the specified user
    //   { $match: { user:new mongoose.Types.ObjectId(user._id) } },
    //   // Lookup brand details
    //   {
    //     $lookup: {
    //       from: 'brands',
    //       localField: 'brand',
    //       foreignField: '_id',
    //       as: 'brandDetails'
    //     }
    //   },
    //   { $unwind: '$brandDetails' },
    //   // Lookup offerDataPoints details
    //   {
    //     $lookup: {
    //       from: 'offerdatas',
    //       localField: 'offerDataPoints.offerData',
    //       foreignField: '_id',
    //       as: 'offerDataDetails'
    //     }
    //   },
    //   // Project required fields and add additional data points
    //   {
    //     $project: {
    //       _id: 0,
    //       brand: '$brandDetails',
    //       totalOffersAvailable: { $sum: '$offerDataDetails.totalOffersAvailable' },
    //       totalBoostedOffers: {
    //         $size: {
    //           $filter: {
    //             input: '$boost',
    //             as: 'boost',
    //             cond: { $ne: ['$$boost', null] }
    //           }
    //         }
    //       }
    //     }
    //   },
    //   // Group by brand to aggregate offer details
    //   {
    //     $group: {
    //       _id: '$brand._id',
    //       brandName: { $first: '$brand.brandName' }, // Adjust the field name as per your Brand schema
    //       totalOffersAvailable: { $sum: '$totalOffersAvailable' },
    //       totalBoostedOffers: { $sum: '$totalBoostedOffers' }
    //     }
    //   }
    // ]);

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
