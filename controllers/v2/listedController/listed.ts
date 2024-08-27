// Objective : define the listed controller for the v2 API
//Author: sanjiv kumar pandit

import { Request, Response } from "express";
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
import offerModel from "../../../models/offer.model";

export const createListed = async (req: IRequest, res: Response) => {
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
      ownerships: [],
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

//TODO : Total O Earn And Total Money Earn and add brand wise
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
          totalCompleted: { $sum: "$completed" },
        },
      },
      {
        $project: {
          _id: 0,
          brands: 1,
          totalListedOffersSum: {
            $sum: ["$totalListedOffersSum", "$totalCompleted"],
          },
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

//TODO : add oearned and how much money earned
export const getAllListedOffersByBrand = async (
  req: Request,
  res: Response
) => {
  try {
    const { id = "All" } = req.params;

    const offers = await Offer.aggregate([
      {
        $match: {
          ...(id === "All" ? {} : { brand: new mongoose.Types.ObjectId(id) }),
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
          // _id: "$offerStatus",
          _id: null,
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
  console.log(req.user);
  try {
    const offers = await Offer.aggregate([
      {
        $match: {
          user: req.user._id, //new mongoose.Types.ObjectId("65efd60968853585bbb96322"),
          $or: [
            {
              offerStatus: OFFER_STATUS.LIVE,
            },
            {
              offerStatus: OFFER_STATUS.SOLD,
            },
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
          offerName: {
            $first: "$offerName",
          },
          offerDescription: {
            $first: "$offerDescription",
          },
          totalOffersAvailable: {
            $first: "$totalOffersAvailable",
          },
          soldOffers: {
            $first: "$totalOfferSold",
          },
          offerThumbnail: {
            $first: "$offerDataDetails.offerThumbnail",
          },
          offerAvailabilityStartDate: {
            $first: "$offerDataDetails.offerAvailabilityStartDate",
          },
          offerAvailabilityEndDate: {
            $first: "$offerDataDetails.offerAvailabilityEndDate",
          },
          serviceStartDate: {
            $first: "$offerDataDetails.serviceStartDate",
          },
          serviceEndDate: {
            $first: "$offerDataDetails.serviceEndDate",
          },
          offerLiveTillSoldOut: {
            $first: "$offerDataDetails.offerLiveTillSoldOut",
          },
          offerStatus: {
            $first: "$offerStatus",
          },
          brand: {
            $first: "$brand",
          },
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
        $unwind: {
          path: "$collecteds",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          metadata: [
            {
              $group: {
                _id: null,
                totalListed: {
                  $sum: 1,
                },
                totalListedOffersCount: {
                  $sum: "$totalOffersAvailable",
                },
                soldStatusCount: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$offerStatus", 5],
                      },
                      1,
                      0,
                    ],
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
            {
              $skip: skip,
            },
            {
              $limit: Number(perPage),
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

    // console.log("offers", req.user._id, offers);
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

export const getOfferDetails = async (req: IRequest, res: Response) => {
  const { page = 1, perPage = 5 }: any = req.query;
  const skip = (parseInt(page) - 1) * parseInt(perPage);
  console.log(req.user);
  try {
    const offerDetails = await Listed.aggregate([
      {
        $match: {
          offer: new mongoose.Types.ObjectId(req.params.id),
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
        $unwind: "$offer",
      },
      {
        $lookup: {
          from: "outlets",
          localField: "offer.outlets",
          foreignField: "_id",
          as: "outlets",
        },
      },
      {
        $lookup: {
          from: "offerdatas",
          localField: "offer.offerDataPoints.offerData",
          foreignField: "_id",
          as: "offerDataDetails",
        },
      },
      {
        $unwind: "$offerDataDetails",
      },
      {
        $lookup: {
          from: "ownerships",
          localField: "ownerships",
          foreignField: "_id",
          as: "ownerships",
          pipeline: [
            {
              $group: {
                _id: null,
                totalOEarned: {
                  $sum: "$oEarned",
                },
                totalEarned: {
                  $sum: "$spent",
                },
                totalCustomer: {
                  $sum: {
                    $size: "$owner",
                  },
                },
                customers: {
                  $push: "$owner.ownerId",
                },
              },
            },
          ],
        },
      },
    ]);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Listed Offer",
      error: null,
      data: offerDetails.length > 0 ? offerDetails[0] : null,
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
                localField: "ownerships",
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

//TODO : offer image
export const getPendingOffersByBrand = async (req: IRequest, res: Response) => {
  try {
    const { id = "" } = req.params;
    if (id == "") {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "brand id required",
        error: "brand id required",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const { codeStatus = OFFER_COLLECTION_EVENTS.COLLECTED } = req.query;

    console.log("id", id);
    const listedPendingOffers = await Listed.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          brand: new mongoose.Types.ObjectId(id),
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
                from: "users",
                localField: "owner.ownerId",
                foreignField: "_id",
                as: "customer",
                pipeline: [
                  {
                    $match: {
                      "offer_access_codes.status": 2,
                    },
                  },
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
          x: "hii",
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

export const getCompletedOffersByBrand = async (
  req: IRequest,
  res: Response
) => {
  try {
    const brandId = req.params.id;
    if (brandId == "" || brandId == undefined) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "brand id is required",
        error: "brand id is required",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const completed = await offerModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          brand: new mongoose.Types.ObjectId(brandId),
          offerStatus: 2,
        },
      },
      {
        $lookup: {
          from: "offerdatas",
          localField: "offerDataPoints.offerData",
          foreignField: "_id",
          as: "offerdatas",
        },
      },
      {
        $unwind: "$offerdatas",
      },
      {
        $match: {
          $or: [
            {
              "offerdatas.offerAvailabilityEndDate": {
                $lte: new Date(),
              },
            },

            {
              "offerdatas.offerLiveTillSoldOut": true,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "listeds",
          localField: "_id",
          foreignField: "offer",
          as: "listeds",
          pipeline: [
            {
              $lookup: {
                from: "ownerships",
                localField: "ownerships",
                foreignField: "_id",
                as: "ownerships",
                pipeline: [
                  {
                    $project: {
                      owner: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "owner.ownerId",
                      foreignField: "_id",
                      as: "user",
                      pipeline: [
                        {
                          $project: {
                            device: 0,
                            addresses: 0,
                            wishLists: 0,
                            likes: 0,
                            bankAccounts: 0,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: "$user",
                  },
                  {
                    $project: {
                      owner: 0,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $unwind: "$listeds",
      },
      {
        $addFields: {
          serviceTypeOfferLiveTillSoldOut: "$offerdatas.offerLiveTillSoldOut",
          serviceCloseDate: "$offerdatas.offerAvailabilityEndDate",
        },
      },
      {
        $project: {
          boost: 0,
          checkpoint: 0,
          offerDataPoints: 0,
          offerdatas: 0,
        },
      },
      {
        $facet: {
          offers: [
            // {
            //   $project: {
            //     boost: 0,
            //     checkpoint: 0,
            //     offerDataPoints: 0,
            //     offerdatas: 0
            //   }
            // }
          ],

          totalOfferCount: [
            {
              $count: "offers",
            },
          ],
          fullySoldCount: [
            {
              $match: {
                totalOffersAvailable: 0,
              },
            },

            {
              $count: "offers",
            },
          ],
          valueStats: [
            {
              $lookup: {
                from: "ologs",
                localField: "_id",
                foreignField: "offer",
                as: "ologs",
              },
            },
            {
              $unwind: "$ologs",
            },
            {
              $group: {
                _id: null,
                oEarned: {
                  $sum: "$ologs.seller.oQuantity",
                },
                moneyEarned: {
                  $sum: "$ologs.amount",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          offers: 1,
          totalOfferCount: {
            $first: "$totalOfferCount.offers",
          },
          fullySoldCount: {
            $first: "$fullySoldCount.offers",
          },
          valueStats: {
            $first: "$valueStats",
          },
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "success",
      error: null,
      data: completed.length > 0 ? completed[0] : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Listed Completed Offers By Brand", error.message, error);
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

export const getCustomersByOffer = async (req: IRequest, res: Response) => {
  try {
    const offerId = req.params.id;
    if (offerId == "" || offerId == undefined) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "offer id is required",
        error: "offer id is required",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const lists = await Listed.aggregate([
      {
        $match: {
          offer: new mongoose.Types.ObjectId(offerId),
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
                from: "users",
                localField: "owner.ownerId",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      device: 0,
                      addresses: 0,
                      wishLists: 0,
                      likes: 0,
                      bankAccounts: 0,
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$owner",
            },
            // {
            //   $unwind: "$offer_access_codes"
            // },
            // {
            //   $addFields: {
            //     status: {
            //       $cond: {
            //         if: {
            //           $eq: [
            //             "$offer_access_codes.status",
            //             "delivered"
            //           ]
            //         },
            //         then: "delivered",
            //         else: "collected"
            //       }
            //     }
            //   }
            // },
            {
              $addFields: {
                status: {
                  $cond: [
                    {
                      $eq: [
                        {
                          $size: {
                            $filter: {
                              input: "$offer_access_codes",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.status",
                                  OFFER_COLLECTION_EVENTS.VERIFIED,
                                ],
                              },
                            },
                          },
                        },
                        1,
                      ],
                    },
                    OFFER_COLLECTION_EVENTS.VERIFIED,
                    OFFER_COLLECTION_EVENTS.COLLECTED,
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $facet: {
          customers: [
            {
              $project: {
                ownerships: 1,
              },
            },
          ],
          offer: [
            {
              $group: {
                _id: "$offer",
              },
            },
            {
              $lookup: {
                from: "offers",
                localField: "_id",
                foreignField: "_id",
                as: "offers",
              },
            },
          ],
          stats: [
            {
              $unwind: "$ownerships",
            },
            {
              $unwind: "$ownerships.offer_access_codes",
            },
            {
              $match: {
                "ownerships.offer_access_codes.status": {
                  $in: [
                    OFFER_COLLECTION_EVENTS.VERIFIED,
                    OFFER_COLLECTION_EVENTS.COLLECTED,
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$ownerships.offer_access_codes.status",

                count: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          customers: {
            $first: "$customers.ownerships",
          },
          statsEnum: [
            { _id: 3, value: "verified" },
            { _id: 2, value: "collected" },
          ],
          stats: 1,
          offer: {
            $first: "$offer.offers",
          },
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "success",
      error: null,
      data: lists.length > 0 ? lists[0] : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Listed Customer Offers By Brand", error.message, error);
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

export const getCustomerOffersDetails = async (
  req: IRequest,
  res: Response
) => {
  try {
    const { cid, oid = "" } = req.params;

    if (!cid) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "customer id is required",
        error: null,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const filter =
      oid && oid != ""
        ? [
            {
              $match: {
                offer: new mongoose.Types.ObjectId(oid),
              },
            },
          ]
        : [];
    const lists = await Ownership.aggregate([
      {
        $match: {
          "owner.ownerId": new mongoose.Types.ObjectId(cid), //req.user._id
          "offer_access_codes.status": {$gte: OFFER_COLLECTION_EVENTS.COLLECTED},
        },
      },
      {
        $project: {
          // owner:1,
          transactions: 1,
          offer_access_codes: 1,
        },
      },

      {
        $lookup: {
          from: "collecteds",
          localField: "_id",
          foreignField: "ownership",
          as: "collecteds",
          pipeline: filter,
        },
      },
      { $unwind: "$collecteds" },
      {
        $lookup: {
          from: "ologs",
          localField: "transactions",
          foreignField: "_id",
          as: "transactions",
          pipeline: [
            {
              $project: {
                amount: 1,
                _id: 1,
                createdAt: 1,
                quantity: 1,
              },
            },
          ],
        },
      },
      // {
      //   $addFields: {
      //     collecteds: {
      //       $first: "$collecteds"
      //     }
      //   }
      // },
      {
        $lookup: {
          from: "outlets",
          localField: "collecteds.outlet",
          foreignField: "_id",
          as: "outlet",
        },
      },
      {
        $lookup: {
          from: "offerdatas",
          localField: "collecteds.offerDataId",
          foreignField: "_id",
          as: "offerData",
          pipeline: [
            {
              $project: {
                minimumOfferUnitItem: 1,
                serviceEndDate: 1,
                serviceEndTime: 1,
                serviceStartDate: 1,
                serviceStartTime: 1,
                offerPriceAmount: 1,
                oRewardDeductPercentagePerSale: 1,
                oRewardDeductPercentageLatePayment: 1,
                totalOfferUnitItem: 1,
                offerUnitType: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "collecteds.brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $addFields: {
          outlet: {
            $first: "$outlet",
          },
          brand: {
            $first: "$brand",
          },
          offerData: {
            $first: "$offerData",
          },
        },
      },
      {
        $project: {
          collecteds: 0,
        },
      },
    ]);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "success",
      error: null,
      data: lists,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Listed Customer Offers By Brand", error.message, error);
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
          ownerships: 0,
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

    if (accessCodeObjectArr[0].status === OFFER_COLLECTION_EVENTS.VERIFIED) {
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
    //TODO :need to change id to offer code
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
        msg: "invalid ownership code",
        error: "invalid ownership code",
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
      ownerships: { $in: [ownership._id] },
    });

    if (!listedOffer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "owner is invalid",
        error: "owner is invalid",
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    ownership.offer_access_codes = ownership.offer_access_codes.map(
      (code: any) => {
        if (code.code === id) {
          code.status = OFFER_COLLECTION_EVENTS.VERIFIED;
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
