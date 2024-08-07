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
import { IRequest } from "../../../interfaces/IRequest";
import {
  OFFER_COLLECTION_EVENTS,
  OFFER_STATUS,
  STATUS,
} from "../../../config/enums";
import Ownership from "../../../models/ownership.model";
import Collected from "../../../models/collected.model";

export const createListed = async (req: IRequest, res: Response) => {
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
    let offerDataArr = offer.offerDataPoints;
    const maxVersionObject = offerDataArr.reduce(
      (max, obj) => (obj.version > max.version ? obj : max),
      offerDataArr[0]
    );
    const newOfferListed = new Listed({
      user: req.user._id,
      offer: offer._id,
      brand: offer.brand,
      ownership: [],
    });
    newOfferListed.offer = id;
    await newOfferListed.save();
    offer.offerStatus = OFFER_STATUS.LIVE;
    await offer.save();

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

//TODO : Total O Earn And Total Money Earn
export const getAllListedBrands = async (req: IRequest, res: Response) => {
  try {
    const { user } = req;
    const { codeStatus = OFFER_COLLECTION_EVENTS.COLLECTED } = req.query;
    const brands = await Brand.aggregate([
      {
        $match: {
          user: user._id,
          status: STATUS.LIVE,
        },
      },
      {
        $lookup: {
          from: "collecteds",
          localField: "_id",
          foreignField: "brand",
          as: "collecteds",
          pipeline: [
            {
              $lookup: {
                from: "ownerships",
                localField: "ownership",
                foreignField: "_id",
                as: "ownerships",
              },
            },
            {
              $unwind: "$ownerships",
            },
            {
              $group: {
                _id: "$brand",
                oEarned: {
                  $sum: "$ownerships.oEarned",
                },
                earn: {
                  $sum: "$ownerships.spent",
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          brandTransaction: { $first: "$collecteds" },
        },
      },
      {
        $lookup: {
          from: "offers",
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
            {
              $group: {
                _id: "$brand",
                totalPushedOffers: {
                  $sum: {
                    $cond: [
                      { $eq: ["$offerStatus", OFFER_STATUS.PAUSED] },
                      1,
                      0,
                    ],
                  },
                },
                totalListedOffers: {
                  $sum: {
                    $cond: [{ $eq: ["$offerStatus", OFFER_STATUS.LIVE] }, 1, 0],
                  },
                },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ["$offerStatus", OFFER_STATUS.SOLD] }, 1, 0],
                  },
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalPushedOffers: {
            $arrayElemAt: ["$offers.totalPushedOffers", 0],
          },
          totalListedOffers: {
            $arrayElemAt: ["$offers.totalListedOffers", 0],
          },
          completed: { $arrayElemAt: ["$offers.completed", 0] },
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
          totalListedOffers: 1,
          completed: 1,
          brandTransaction: 1,
        },
      },
      {
        $group: {
          _id: null,
          brands: { $push: "$$ROOT" },
          totalListedOffersSum: { $sum: "$totalListedOffers" },
        },
      },
      {
        $project: {
          _id: 0,
          brands: 1,
          totalListedOffersSum: 1,
        },
      },
    ]);

    const result = {
      brands: brands[0].brands,
      totalListedOffersSum: brands[0].totalListedOffersSum,
      totalBrands: brands[0].brands.length,
    };

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "All brands",
      error: null,
      data: result,
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

export const getAllListedOffersByBrand = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // const offers = await Offer.aggregate([
    //   {
    //     $match: {
    //       brand: new mongoose.Types.ObjectId(id),
    //       // offerStatus: OFFER_STATUS.LIVE,
    //       $or: [
    //         {
    //           offerStatus: OFFER_STATUS.LIVE,
    //         },
    //         {
    //           offerStatus: OFFER_STATUS.SOLD,
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "offerdatas",
    //       localField: "offerDataPoints.offerData",
    //       foreignField: "_id",
    //       as: "offerDataDetails",
    //     },
    //   },
    //   {
    //     $unwind: "$offerDataDetails",
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       offerName: { $first: "$offerName" },
    //       offerDescription: { $first: "$offerDescription" },
    //       totalOffersAvailable: { $first: "$totalOffersAvailable" },
    //       soldOffers: { $first: "$totalOfferSold" },
    //       offerThumbnail: { $first: "$offerDataDetails.offerThumbnail" },
    //       offerAvailabilityStartDate: {
    //         $first: "$offerDataDetails.offerAvailabilityStartDate",
    //       },
    //       offerAvailabilityEndDate: {
    //         $first: "$offerDataDetails.offerAvailabilityEndDate",
    //       },
    //       serviceStartDate: { $first: "$offerDataDetails.serviceStartDate" },
    //       serviceEndDate: { $first: "$offerDataDetails.serviceEndDate" },
    //       offerLiveTillSoldOut: {
    //         $first: "$offerDataDetails.offerLiveTillSoldOut",
    //       },
    //       offerStatus: { $first: "$offerStatus" },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       offerName: 1,
    //       offerDescription: 1,
    //       soldOffers: 1,
    //       offerThumbnail: 1,
    //       offerAvailabilityStartDate: 1,
    //       offerAvailabilityEndDate: 1,
    //       serviceStartDate: 1,
    //       serviceEndDate: 1,
    //       offerLiveTillSoldOut: 1,
    //       totalOffersAvailable: 1,
    //       offerStatus: 1,
    //     },
    //   },
    //   {
    //     $group: {
    //       // _id: null,
    //       _id: "$offerStatus",
    //       totalListed: { $sum: 1 },
    //       offers: { $push: "$$ROOT" },
    //       totalListedOffersCount: {
    //         $sum: "$totalOffersAvailable",
    //       },
    //       soldStatusCount: {
    //         $sum: {
    //           $cond: [{ $eq: ["$offerStatus", OFFER_STATUS.SOLD] }, 1, 0],
    //         },
    //       },

    //       // totalListedOffersSum: { $count: "$$ROOT" },
    //       // pushedOfferCount: { $sum: "$totalPushedOffers" },
    //     },
    //   },
    //   // { $group: { _id: "$offerStatus", count: { $sum: 1 } } },
    //   {
    //     $project: {
    //       _id: 0,
    //       offers: 1,
    //       totalListed: 1,
    //       offerStatus: 1,
    //       totalListedOffersCount: 1,
    //       soldStatusCount: 1,
    //       // totalListedOffersSum: 1,
    //       // pushedOfferCount: 1,
    //     },
    //   },
    // ]);

    const offers = await Offer.aggregate([
      {
        $match: {
          brand: new mongoose.Types.ObjectId(id),
          $or: [
            { offerStatus: OFFER_STATUS.LIVE },
            { offerStatus: OFFER_STATUS.SOLD },
            { offerStatus: OFFER_STATUS.PAUSED },
          ],
        },
      },
      {
        $lookup: {
          from: "offerdatas",
          localField: "offerDataPoints.offerData",
          foreignField: "_id",
          as: "offerDataDetails",
        },
      },
      {
        $unwind: "$offerDataDetails",
      },
      {
        $group: {
          _id: "$_id",
          offerName: { $first: "$offerName" },
          offerDescription: { $first: "$offerDescription" },
          totalOffersAvailable: { $first: "$totalOffersAvailable" },
          soldOffers: { $first: "$totalOfferSold" },
          offerThumbnail: { $first: "$offerDataDetails.offerThumbnail" },
          offerAvailabilityStartDate: {
            $first: "$offerDataDetails.offerAvailabilityStartDate",
          },
          offerAvailabilityEndDate: {
            $first: "$offerDataDetails.offerAvailabilityEndDate",
          },
          serviceStartDate: { $first: "$offerDataDetails.serviceStartDate" },
          serviceEndDate: { $first: "$offerDataDetails.serviceEndDate" },
          offerLiveTillSoldOut: {
            $first: "$offerDataDetails.offerLiveTillSoldOut",
          },
          offerStatus: { $first: "$offerStatus" },
        },
      },
      {
        $project: {
          _id: 1,
          offerName: 1,
          offerDescription: 1,
          soldOffers: 1,
          offerThumbnail: 1,
          offerAvailabilityStartDate: 1,
          offerAvailabilityEndDate: 1,
          serviceStartDate: 1,
          serviceEndDate: 1,
          offerLiveTillSoldOut: 1,
          totalOffersAvailable: 1,
          offerStatus: 1,
        },
      },
      {
        $group: {
          _id: "$offerStatus",
          totalListed: { $sum: 1 },
          offers: { $push: "$$ROOT" },
          totalListedOffersCount: { $sum: "$totalOffersAvailable" },
          soldStatusCount: {
            $sum: {
              $cond: [{ $eq: ["$offerStatus", OFFER_STATUS.SOLD] }, 1, 0],
            },
          },
          pushedStatusCount: {
            $sum: {
              $cond: [{ $eq: ["$offerStatus", OFFER_STATUS.PAUSED] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          offers: 1,
          totalListed: 1,
          totalListedOffersCount: 1,
          soldStatusCount: 1,
          pushedStatusCount: 1,
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: offers.length > 0 ? offers[0] : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Listed Offers By Brand", error.message, error);
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

export const getAllListedOffersByUser = async (
  req: IRequest,
  res: Response
) => {
  const { page = 1, perPage = 5 }: any = req.query;
  const skip = (parseInt(page) - 1) * parseInt(perPage);

  try {
    const offers = await Offer.aggregate([
      {
        $match: {
          user: req.user._id,
          $or: [
            { offerStatus: OFFER_STATUS.LIVE },
            { offerStatus: OFFER_STATUS.SOLD },
          ],
        },
      },
      {
        $lookup: {
          from: "offerdatas",
          localField: "offerDataPoints.offerData",
          foreignField: "_id",
          as: "offerDataDetails",
        },
      },
      {
        $unwind: "$offerDataDetails",
      },
      {
        $group: {
          _id: "$_id",
          offerName: { $first: "$offerName" },
          offerDescription: { $first: "$offerDescription" },
          totalOffersAvailable: { $first: "$totalOffersAvailable" },
          soldOffers: { $first: "$totalOfferSold" },
          offerThumbnail: { $first: "$offerDataDetails.offerThumbnail" },
          offerAvailabilityStartDate: {
            $first: "$offerDataDetails.offerAvailabilityStartDate",
          },
          offerAvailabilityEndDate: {
            $first: "$offerDataDetails.offerAvailabilityEndDate",
          },
          serviceStartDate: { $first: "$offerDataDetails.serviceStartDate" },
          serviceEndDate: { $first: "$offerDataDetails.serviceEndDate" },
          offerLiveTillSoldOut: {
            $first: "$offerDataDetails.offerLiveTillSoldOut",
          },
          offerStatus: { $first: "$offerStatus" },
          brand: { $first: "$brand" },
        },
      },
      {
        $project: {
          _id: 1,
          offerName: 1,
          offerDescription: 1,
          soldOffers: 1,
          offerThumbnail: 1,
          offerAvailabilityStartDate: 1,
          offerAvailabilityEndDate: 1,
          serviceStartDate: 1,
          serviceEndDate: 1,
          offerLiveTillSoldOut: 1,
          totalOffersAvailable: 1,
          offerStatus: 1,
          brand: 1,
        },
      },
      {
        $lookup: {
          from: "collecteds",
          localField: "brand",
          foreignField: "brand",
          as: "collecteds",
          pipeline: [
            {
              $lookup: {
                from: "ownerships",
                localField: "ownership",
                foreignField: "_id",
                as: "ownerships",
              },
            },
            {
              $unwind: "$ownerships",
            },
            {
              $group: {
                _id: "$brand",
                oEarned: {
                  $sum: "$ownerships.oEarned",
                },
                spent: {
                  $sum: "$ownerships.spent",
                },
              },
            },
          ],
        },
      },
      {
        $unwind: "$collecteds",
      },
      {
        $facet: {
          metadata: [
            {
              $group: {
                _id: null,
                totalListed: { $sum: 1 },
                totalListedOffersCount: {
                  $sum: "$totalOffersAvailable",
                },
                soldStatusCount: {
                  $sum: {
                    $cond: [{ $eq: ["$offerStatus", 5] }, 1, 0],
                  },
                },
                totalOEarned: {
                  $sum: "$collecteds.oEarned",
                },
                totalSpent: {
                  $sum: "$collecteds.spent",
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalListed: 1,
                totalListedOffersCount: 1,
                soldStatusCount: 1,
                totalOEarned: 1,
                totalSpent: 1,
              },
            },
          ],
          data: [
            { $skip: skip },
            { $limit: Number(perPage) },
            {
              $project: {
                _id: 1,
                offerName: 1,
                offerDescription: 1,
                soldOffers: 1,
                offerThumbnail: 1,
                offerAvailabilityStartDate: 1,
                offerAvailabilityEndDate: 1,
                serviceStartDate: 1,
                serviceEndDate: 1,
                offerLiveTillSoldOut: 1,
                totalOffersAvailable: 1,
                offerStatus: 1,
                brand: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          metadata: {
            $arrayElemAt: ["$metadata", 0],
          },
          offers: "$data",
        },
      },
    ]);

    console.log("offers", req.user._id, offers);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: offers.length > 0 ? offers[0] : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Listed Offers By Brand", error.message, error);
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

export const getListedOfferDetails = async (req: IRequest, res: Response) => {
  try {
    const { brandId, offerId } = req.params;

    const offer = await Offer.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(offerId),
          brand: new mongoose.Types.ObjectId(brandId),
        },
      },
      {
        $lookup: {
          from: "offerdatas",
          localField: "offerDataPoints.offerData",
          foreignField: "_id",
          as: "offerDataObj",
        },
      },
      {
        $lookup: {
          from: "collecteds",
          localField: "brand",
          foreignField: "brand",
          as: "collecteds",
          pipeline: [
            {
              $match: {
                offer: new mongoose.Types.ObjectId(offerId),
              },
            },
            {
              $lookup: {
                from: "ownerships",
                localField: "ownership",
                foreignField: "_id",
                as: "ownerships",
              },
            },
            {
              $unwind: "$ownerships",
            },
            {
              $addFields: {
                customers: {
                  $first: {
                    $filter: {
                      input: "$ownerships.owner",
                      as: "item",
                      cond: {
                        $eq: ["$$item.isCurrentOwner", true],
                      },
                    },
                  },
                },
              },
            },
            {
              $group: {
                _id: "$offer",
                oEarned: {
                  $sum: "$ownerships.oEarned",
                },
                spent: {
                  $sum: "$ownerships.spent",
                },
                totalCustomer: {
                  $sum: 1,
                },
                customerIds: {
                  $addToSet: "$customers.ownerId",
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          offerDataObj: {
            $first: "$offerDataObj",
          },
        },
      },
      {
        $addFields: {
          salesAndEarnsObj: {
            $first: "$collecteds",
          },
        },
      },
      {
        $lookup: {
          from: "outlets",
          localField: "outlets",
          foreignField: "_id",
          as: "outlets",
        },
      },
    ]);
    if (offer.length === 0) {
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
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: offer[0],
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Listed Offer Details", error.message, error);
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

export const getPendingOffersByBrand = async (req: IRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { codeStatus = OFFER_COLLECTION_EVENTS.COLLECTED } = req.query;

    console.log("id", id);
    const listedPendingOffers = await Listed.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          brand: new mongoose.Types.ObjectId(id),
        },
      },
      // {
      //   $lookup: {
      //     from: "ownerships",
      //     localField: "ownership",
      //     foreignField: "_id",
      //     as: "ownerships",
      //     pipeline: [
      //       {
      //         $lookup: {
      //           from: "users",
      //           localField: "owner.ownerId",
      //           foreignField: "_id",
      //           as: "customer",
      //           pipeline: [
      //             {
      //               $project: {
      //                 _id: 1,
      //                 name: 1,
      //               },
      //             },
      //           ],
      //         },
      //       },
      //       {
      //         $addFields: {
      //           customer: {
      //             $first: "$customer",
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "offers",
      //     localField: "offer",
      //     foreignField: "_id",
      //     as: "offers",
      //     pipeline: [
      //       {
      //         $lookup: {
      //           from: "outlets",
      //           localField: "outlets",
      //           foreignField: "_id",
      //           as: "outlets",
      //         },
      //       },
      //       {
      //         $project: {
      //           _id: 1,
      //           offerName: 1,
      //           offerDescription: 1,
      //           totalOfferSold: 1,
      //           offerDataPoints: 1,
      //           totalOffersAvailable: 1,
      //           outlets: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $addFields: {
      //     offerDetails: { $first: "$offers" },
      //   },
      // },
      // {
      //   $facet: {
      //     listed: [
      //       {
      //         $project: {
      //           _id: 1,
      //           user: 1,
      //           brand: 1,
      //           ownerships: 1,
      //           offers: 1,
      //           offerDetails: 1,
      //         },
      //       },
      //     ],
      //     collectedCount: [
      //       {
      //         $unwind: "$ownerships",
      //       },
      //       {
      //         $unwind: "$ownerships.offer_access_codes",
      //       },
      //       {
      //         $match: {
      //           "ownerships.offer_access_codes.status": "collected",
      //         },
      //       },
      //       {
      //         $count: "totalCollectedOfferAccessCodes",
      //       },
      //     ],
      //     uniqueCustomers: [
      //       {
      //         $unwind: "$ownerships",
      //       },
      //       {
      //         $unwind: "$ownerships.owner",
      //       },
      //       {
      //         $group: {
      //           _id: "$ownerships.owner.ownerId",
      //         },
      //       },
      //       {
      //         $count: "totalUniqueCustomers",
      //       },
      //     ],
      //     totalOffers: [
      //       {
      //         $count: "totalOffers",
      //       },
      //     ],
      //     totalOwnerships: [
      //       {
      //         $unwind: "$ownerships",
      //       },
      //       {
      //         $count: "totalOwnerships",
      //       },
      //     ],
      //   },
      // },
      // {
      //   $project: {
      //     listed: "$listed",
      //     totalCollectedOfferAccessCodes: {
      //       $arrayElemAt: ["$collectedCount.totalCollectedOfferAccessCodes", 0],
      //     },
      //     totalUniqueCustomers: {
      //       $arrayElemAt: ["$uniqueCustomers.totalUniqueCustomers", 0],
      //     },
      //     totalOffers: {
      //       $arrayElemAt: ["$totalOffers.totalOffers", 0],
      //     },
      //     totalOrders: {
      //       $arrayElemAt: ["$totalOwnerships.totalOwnerships", 0],
      //     },
      //   },
      // },

      {
        $lookup: {
          from: "ownerships",
          localField: "ownership",
          foreignField: "_id",
          as: "ownerships",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner.ownerId",
                foreignField: "_id",
                as: "customer",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                customer: {
                  $first: "$customer",
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offers",
          pipeline: [
            {
              $lookup: {
                from: "outlets",
                localField: "outlets",
                foreignField: "_id",
                as: "outlets",
              },
            },
            {
              $project: {
                _id: 1,
                offerName: 1,
                offerDescription: 1,
                totalOfferSold: 1,
                offerDataPoints: 1,
                totalOffersAvailable: 1,
                outlets: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          offerDetails: { $first: "$offers" },
        },
      },
      {
        $facet: {
          listed: [
            // {
            //   $project: {
            //     _id: 1,
            //     user: 1,
            //     brand: 1,
            //     ownerships: 1,
            //     offers: 1,
            //     offerDetails: 1
            //   }
            // }
            {
              $unwind: "$ownerships",
            },
            {
              $addFields: {
                ownershipDetails: "$ownerships",
              },
            },
            {
              $project: {
                offers: 0,
                ownership: 0,
                ownerships: 0,
              },
            },
          ],
          collectedCount: [
            {
              $unwind: "$ownerships",
            },
            {
              $unwind: "$ownerships.offer_access_codes",
            },
            {
              $match: {
                "ownerships.offer_access_codes.status": codeStatus,
              },
            },
            {
              $count: "totalCollectedOfferAccessCodes",
            },
          ],
          uniqueCustomers: [
            {
              $unwind: "$ownerships",
            },
            {
              $unwind: "$ownerships.owner",
            },
            {
              $group: {
                _id: "$ownerships.owner.ownerId",
              },
            },
            {
              $count: "totalUniqueCustomers",
            },
          ],
          totalOffers: [
            {
              $count: "totalOffers",
            },
          ],
          totalOwnerships: [
            {
              $unwind: "$ownerships",
            },
            {
              $count: "totalOwnerships",
            },
          ],
        },
      },
      {
        $project: {
          listed: "$listed",
          totalCollectedOfferAccessCodes: {
            $arrayElemAt: ["$collectedCount.totalCollectedOfferAccessCodes", 0],
          },
          totalUniqueCustomers: {
            $arrayElemAt: ["$uniqueCustomers.totalUniqueCustomers", 0],
          },
          totalOffers: {
            $arrayElemAt: ["$totalOffers.totalOffers", 0],
          },
          totalOrders: {
            $arrayElemAt: ["$totalOwnerships.totalOwnerships", 0],
          },
        },
      },
    ]);

    const data = listedPendingOffers.length > 0 ? listedPendingOffers[0] : [];

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: {
        ...data,
      },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Listed Pending Offers By Brand", error.message, error);
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

export const getCustomerDetailsBeforeVerify = async (
  req: IRequest,
  res: Response
) => {
  try {
    const { id }: any = req.body;
    console.log("--", req.body, id);
    const ownership = await Collected.aggregate([
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
          // pipeline: [
          //   {
          //     $project: {
          //       _id: 1,
          //       serviceStartDate: 1,
          //       serviceEndDate: 1,
          //       serviceStartTime: 1,
          //       serviceEndTime: 1,
          //     },
          //   },
          // ],
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
          as: "ownership",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner.ownerId",
                foreignField: "_id",
                as: "customer",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      uid: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                customer: {
                  $first: "$customer",
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          ownershipDetails: {
            $first: "$ownership",
          },
        },
      },
      {
        $project: {
          user: 0,
          ownership: 0,
          offerDatas: 0,
        },
      },
    ]);
    if (ownership.length === 0) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "offer not found to collect",
        error: "offer not found to collect",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const accessCodeObjectArr =
      ownership[0].ownershipDetails.offer_access_codes.filter(
        (ow: any) => ow.code === id
      );

    if (accessCodeObjectArr.length === 0) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "offer not found to collect",
        error: "offer not found to collect",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    if (accessCodeObjectArr[0].status === OFFER_COLLECTION_EVENTS.DELIVERED) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "offer already delivered",
        error: "offer already delivered",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: ownership.length > 0 ? ownership[0] : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Customer Details Before Verify", error.message, error);
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

export const verifyCollectedOffer = async (req: IRequest, res: Response) => {
  try {
    // const { code }: any = req.body;
    const { id, user } = req.body; //JSON.parse(code);

    console.log("body", id, req.body);

    const ownership = await Ownership.findOne({
      offer_access_codes: { $elemMatch: { code: id } },
    });
    if (!ownership) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: " not found",
        error: " not found",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const collectedOffer = await Collected.findOne({
      _id: id,
      user,
    });

    if (!collectedOffer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "unauthorized owner",
        error: "unauthorized owner",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    const listedOffer = await Listed.findOne({
      user: req.user._id,
      ownership: { $in: [ownership._id] },
    });

    if (!listedOffer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: " not found",
        error: " not found",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    ownership.offer_access_codes = ownership.offer_access_codes.map(
      (code: any) => {
        if (code.code === id) {
          code.status = OFFER_COLLECTION_EVENTS.DELIVERED;
        }
        return code;
      }
    );

    console.log(ownership.offer_access_codes);

    await ownership.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Collected Offer Verified and delivered successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Verify Collected Offer", error.message, error);
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

// [
//   {
//     $match: {
//       user: ObjectId("65efd60968853585bbb96322"),
//       brand:ObjectId('6694c5cdf76d30df7594173a')
//     }
//   },
//   {
//     $lookup: {
//       from: "ownerships",
//       localField: "ownership",
//       foreignField: "_id",
//       as: "ownerships",
//       pipeline: [
//         {
//           $lookup: {
//             from: "users",
//             localField: "owner.ownerId",
//             foreignField: "_id",
//             as: "customer",
//             pipeline: [
//               {
//                 $project: {
//                   _id: 1,
//                   name: 1
//                 }
//               }
//             ]
//           }
//         },
//         {
//           $addFields: {
//             customer: {
//               $first: "$customer"
//             }
//           }
//         }
//       ]
//     }
//   },

//   {
//     $lookup: {
//       from: "offers",
//       localField: "offer",
//       foreignField: "_id",
//       as: "offers",
//       pipeline: [
//         {
//           $lookup: {
//             from: "outlets",
//             localField: "outlets",
//             foreignField: "_id",
//             as: "outlets"
//           }
//         },
//         {
//           $project: {
//             _id: 1,
//             offerName: 1,
//             offerDescription: 1,
//             totalOfferSold: 1,
//             offerDataPoints: 1,
//             totalOffersAvailable: 1,
//             outlets: 1
//           }
//         }
//       ]
//     }
//   },
//   {
//     $addFields: {
//       offerDetails: { $first: "$offers" }
//     }
//   }
// ]
