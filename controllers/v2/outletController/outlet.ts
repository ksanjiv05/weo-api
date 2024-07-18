// Objective : Define the Outlet functions that will be used in the routes
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

// Import necessary modules
import { Request, Response } from "express";
import Outlet, { IOutlet } from "../../../models/outlet.model";
import Brand from "../../../models/brand.model";
import logging from "../../../config/logging";
import { validationResult } from "express-validator";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import { IRequest } from "../../../interfaces/IRequest";
import mongoose from "mongoose";
import { OFFER_STATUS, STATUS } from "../../../config/enums";

// Define the functions

// Function to add the outlet
export const addOutlet = async (req: IRequest, res: Response) => {
  try {
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

    //transaction
    const session = await Outlet.startSession();
    session.startTransaction();

    try {
      const outlets: IOutlet[] = req.body;

      // await Outlet.bulkWrite(
      //   outlets.map((outlet) => {
      //     const newOutlet = new Outlet(outlet);
      //     return {
      //       insertOne: {
      //         document: newOutlet,
      //       },
      //     };
      //   })
      // );

      await Outlet.insertMany(outlets, { session });
      const bid = outlets[0].brand;
      await Brand.updateOne(
        { _id: bid },
        {
          $set: {
            status: STATUS.LIVE,
          },
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Brand.updateOne({
      //   _id: outlets[0].brand,
      // }, {
      //   $push: {
      //     outlets: {
      //       $each: resdocs.map((doc) => doc._id),
      //     },
      //   },
      // }).exec();

      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.CREATED,
        msg: "Outlet added successfully",
        error: null,
        data: null,
        code: ERROR_CODES.SUCCESS,
      });
    } catch (error: any) {
      logging.error("Outlet Add", error.message, error);

      await session.abortTransaction();
      session.endSession();
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Internal server error",
        error: error.message,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }
  } catch (error: any) {
    logging.error("Outlet Add", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to update the outlet

export const updateOutlet = async (req: Request, res: Response) => {
  try {
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

    const outletId = req.params.id;
    const outlet = req.body;

    const updatedOutlet = await Outlet.findByIdAndUpdate(outletId, outlet, {
      new: false,
    });

    if (!updatedOutlet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Outlet not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Outlet updated successfully",
      error: null,
      data: updatedOutlet,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Outlet Update", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the outlet by id

export const getOutletById = async (req: Request, res: Response) => {
  try {
    const outletId = req.params.id;

    const outlet = await Outlet.findById(outletId);

    if (!outlet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Outlet not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Outlet found",
      error: null,
      data: outlet,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Outlet by id", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get all the outlets

export const getOutlets = async (req: IRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.admin) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
        msg: "you are not allowed to get Outlets",
        error: "you are not allowed to get Outlets",
        data: null,
        code: ERROR_CODES.AUTH_ERR,
      });
    }
    const { page = 1, perPage = 10, status = "" } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);

    const outlets = await Outlet.find()
      .sort("createdAt")
      .skip(skip)
      .limit(Number(perPage));
    const total = await Outlet.countDocuments({});

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Outlets found",
      error: null,
      data: { outlets, total },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get all outlets", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Outlets not found",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the outlet by brand id

export const getOutletsByBrandId = async (req: Request, res: Response) => {
  try {
    const brandId = req.params.id;

    const outlets = await Outlet.find({ brand: brandId });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Outlet found",
      error: null,
      data: outlets,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Outlet by brand id", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to delete the outlet

export const deleteOutlet = async (req: Request, res: Response) => {
  try {
    const outletId = req.params.id;

    const deletedOutlet = await Outlet.findByIdAndDelete(outletId);

    if (!deletedOutlet) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Outlet not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Outlet deleted successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Outlet Delete", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the outlets by user locations

export const getOutletsByUserLocation = async (req: Request, res: Response) => {
  try {
    const { userLatitude, userLongitude, maxDistance = 1000 }: any = req.query;

    const lat = parseFloat(userLatitude);
    const lng = parseFloat(userLongitude);

    // const outlets = await Outlet.aggregate([
    //   {
    //     $geoNear: {
    //       near: {
    //         type: "Point",
    //         coordinates: [lat, lng],
    //       },
    //       distanceField: "distance",
    //       // distanceField: "dist.calculated",
    //       maxDistance: 5000,
    //       spherical: true,
    //     },
    //   },
    //   {
    //     $sort: {
    //       distance: -1,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       localField: "brand",
    //       foreignField: "_id",
    //       as: "brandDetails",
    //       pipeline: [
    //         {
    //           $match: {
    //             status: OFFER_STATUS.LIVE,
    //           },
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $unwind: "$brandDetails",
    //   },
    //   {
    //     $lookup: {
    //       from: "offers",
    //       localField: "brand",
    //       foreignField: "brand",
    //       as: "offers",
    //       pipeline: [
    //         {
    //           $match: {
    //             status: {
    //               $ne: 1, // 1: pending or draft
    //             },
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: "$brand",
    //             totalListedOffers: {
    //               $sum: {
    //                 $cond: [
    //                   {
    //                     $eq: ["$offerStatus", 2],
    //                   },
    //                   1,
    //                   0,
    //                 ],
    //               },
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $addFields: {
    //       totalListedOffers: {
    //         $arrayElemAt: ["$offers.totalListedOffers", 0],
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       brand: 1,
    //       outletName: 1,
    //       address: 1,
    //       operatingDays: 1,
    //       serviceContacts: 1,
    //       createdAt: 1,
    //       brandDetails: 1,
    //       totalListedOffers: 1,
    //       distance: 1,
    //     },
    //   },
    // ]);

    const outlets = await Outlet.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lat, lng],
          },
          distanceField: "distance",
          maxDistance: 5000,
          spherical: true,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandDetails",
          pipeline: [
            {
              $match: {
                status: STATUS.LIVE,
              },
            },
          ],
        },
      },
      { $unwind: "$brandDetails" },
      {
        $addFields: {
          brandName: "$brandDetails.brandName",
          brandDescription: "$brandDetails.brandDescription",
          brandLogo: "$brandDetails.brandLogo",
        },
      },
      {
        $lookup: {
          from: "offers",
          let: { outletId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$outletId", "$outlets"],
                },
              },
            },
            {
              $group: {
                _id: "$brand",
                totalListedOffers: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$offerStatus", OFFER_STATUS.LIVE],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "offers",
        },
      },
      {
        $match: {
          "offers.0": { $exists: true },
        },
      },
      { $unwind: "$offers" },
      {
        $addFields: {
          totalListedOffers: "$offers.totalListedOffers",
        },
      },
      {
        $project: {
          offers: 0,
          brandDetails: 0,
        },
      },
      // {
      //   $project: {
      //     _id: 1,
      //     outletName: 1,
      //     address: 1,
      //     distance: 1,
      //     offers: 1
      //   }
      // }
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Outlets found",
      error: null,
      data: outlets,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Outlets by user location", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

//https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/
//21.2096818,72.8301963
//21.2056451,72.8383332
