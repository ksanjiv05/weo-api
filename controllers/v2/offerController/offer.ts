//Objective : Define the Offer controller
//Author : Sanjiv Kumar Pandit

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Offer, { IOffer } from "../../../models/offer.model";
import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";

// Function to add the offer
export const addOffer = async (req: Request, res: Response) => {
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

    const { user } = req.body;

    const offer: IOffer = {
      user: user._id,
      ...req.body,
    };

    const newOffer = new Offer(offer);

    await newOffer.save();

    if (!newOffer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Offer not saved",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Offer added successfully",
      error: null,
      data: null,
    });
  } catch (error: any) {
    logging.error("Add Offer", error.message, error);

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

// Function to get the offer
export const getOffers = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.find({});

    if (!offer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Offer not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Offer found",
      error: null,
      data: offer,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Offer", error.message, error);

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

// Function to get offer by id
export const getOfferById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);

    if (!offer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Offer not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Offer found",
      error: null,
      data: offer,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Offer by id", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Offer not found",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get offer by user id
export const getOfferByUserId = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    const offer = await Offer.find({ user: user._id });

    if (!offer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Offer not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Offer found",
      error: null,
      data: offer,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Offer by user id", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Offer not found",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to update the offer
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndUpdate(id, req.body, { new: false });

    if (!offer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Offer not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Offer updated successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Update Offer", error.message, error);

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

// Function to delete the offer
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findOneAndUpdate(
      { _id: id },
      { isDeleted: true }
    );

    if (!offer) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Offer not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Offer deleted successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Delete Offer", error.message, error);

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

// const userLatitude = 34.0522; // example latitude
// const userLongitude = -118.2437; // example longitude
// const maxDistance = 10000; // 10 km in meters

// db.offers
//   .aggregate([
//     {
//       $lookup: {
//         from: "outlets",
//         localField: "outlets",
//         foreignField: "_id",
//         as: "outletDetails",
//       },
//     },
//     {
//       $unwind: "$outletDetails",
//     },
//     {
//       $match: {
//         "outletDetails.location.coordinates": {
//           $nearSphere: {
//             $geometry: {
//               type: "Point",
//               coordinates: [userLongitude, userLatitude],
//             },
//             $maxDistance: maxDistance,
//           },
//         },
//       },
//     },
//     {
//       $group: {
//         _id: "$_id",
//         offerName: { $first: "$offerName" },
//         offerDescription: { $first: "$offerDescription" },
//         outlets: { $push: "$outletDetails" },
//       },
//     },
//   ])
//   .toArray();

//or

// const userLatitude = 34.0522; // example latitude
// const userLongitude = -118.2437; // example longitude
// const maxDistance = 10000; // 10 km in meters

// db.offers
//   .aggregate([
//     {
//       $lookup: {
//         from: "outlets",
//         localField: "outlets",
//         foreignField: "_id",
//         as: "outletDetails",
//       },
//     },
//     {
//       $unwind: "$outletDetails",
//     },
//     {
//       $match: {
//         "outletDetails.location.coordinates": {
//           $geoNear: {
//             $geometry: {
//               type: "Point",
//               coordinates: [userLongitude, userLatitude],
//             },
//             $maxDistance: maxDistance,
//           },
//         },
//       },
//     },
//     {
//       $group: {
//         _id: "$_id",
//         offerName: { $first: "$offerName" },
//         offerDescription: { $first: "$offerDescription" },
//         outlets: { $addToSet: "$outletDetails" },
//       },
//     },
//   ])
//   .toArray();