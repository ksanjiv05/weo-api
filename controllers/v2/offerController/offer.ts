//Objective : Define the Offer controller
//Author : Sanjiv Kumar Pandit

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Offer, { IOffer } from "../../../models/offer.model";
import Listed, { IListed } from "../../../models/listed.model";

import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import OfferData, { IOfferData } from "../../../models/offer.data.model";
import { OFFER_STATUS, STATUS } from "../../../config/enums";
import { add } from "winston";
import { IRequest } from "../../../interfaces/IRequest";

// Function to add the offer
export const addOffer = async (req: IRequest, res: Response) => {
  const session = await Offer.startSession();
  session.startTransaction();
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

    // create session for transaction

    const { user } = req;

    const offer: IOffer = {
      user: user._id,
      ...req.body,
    };

    const newOffer = new Offer(offer);

    const offerData: IOfferData = new OfferData({
      offerId: newOffer._id,
    });
    await offerData.save({
      session,
    });

    newOffer.offerDataPoints = [{ offerData: offerData._id, version: 1 }];
    await newOffer.save({ session });

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
    await session.commitTransaction();
    session.endSession();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Offer added successfully",
      error: null,
      data: newOffer,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Add Offer", error.message, error);
    await session.abortTransaction();
    session.endSession();
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

// Function to add the offer
export const addOfferDataPoints = async (req: Request, res: Response) => {
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

    // create session for transaction
    const session = await Offer.startSession();
    session.startTransaction();

    try {
      const { offerId, checkpoint } = req.body;

      const offer = await Offer.findById(offerId);
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

      if (offer.checkpoint != 1 && offer.checkpoint >= checkpoint) {
        updateOfferData(req, res);
        return;
      }

      delete req.body._id;

      const offerData: IOfferData = new OfferData({
        ...req.body,
      });
      await offerData.save({
        session,
      });

      // await Offer.findByIdAndUpdate(
      //   offerId,
      //   {
      //     $push: {
      //       offerDataPoints: { offerData: offerData._id, version: 1 },
      //     },
      //   },
      //   { session }
      // );

      offer.offerDataPoints.push({
        offerData: offerData._id,
        version: offer.offerDataPoints.length + 1,
      });

      await offer.save({ session });
      // commit transaction
      await session.commitTransaction();
      session.endSession();
      console.log("_23__", req.body);
      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.CREATED,
        msg: "Offer data points added successfully",
        error: null,
        data: offerData,
        code: ERROR_CODES.SUCCESS,
      });
    } catch (error: any) {
      console.log("error", error);
      await session.abortTransaction();
      session.endSession();

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

export const updateOfferData = async (req: Request, res: Response) => {
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
    const { id } = req.params;
    const { status } = req.body;

    if (status === STATUS.LIVE) {
      addOfferDataPoints(req, res);
      return;
    }

    // const offer = await OfferData.findByIdAndUpdate(id, req.body, {
    //   new: false,
    // });

    const offer = await OfferData.updateOne(
      { _id: id },
      {
        $set: {
          ...req.body,
        },
      }
    );
    console.log(offer, req.body);
    if (req.body.checkpoint == 5) {
      await Offer.updateOne(
        {
          _id: req.body?.offerId,
        },
        {
          $set: {
            totalOffersAvailable: req.body?.totalOffersAvailable,
          },
        }
      );
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
    logging.error("Update Offer Data", error.message, error);

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

// Function to update the offer
export const updateOffer = async (req: Request, res: Response) => {
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

//
export const toListOffer = async (req: IRequest, res: Response) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return responseObj({
  //     resObj: res,
  //     type: "error",
  //     statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
  //     msg: "fields are required",
  //     error: errors.array({}),
  //     data: null,
  //     code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
  //   });
  // }

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
    logging.error("Offer Listed Offer", error.message, error);

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
export const getOfferByUserId = async (req: IRequest, res: Response) => {
  try {
    const { user } = req;
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

// Function to get the offers by user location
export const getOffersByLocation = async (req: Request, res: Response) => {
  try {
    const { userLatitude, userLongitude, maxDistance } = req.query;

    const offers = await Offer.aggregate([
      {
        $lookup: {
          from: "outlets",
          localField: "outlets",
          foreignField: "_id",
          as: "outletDetails",
        },
      },
      {
        $unwind: "$outletDetails",
      },
      {
        $match: {
          "outletDetails.location.coordinates": {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: [userLongitude, userLatitude],
              },
              $maxDistance: maxDistance,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          offerName: { $first: "$offerName" },
          offerDescription: { $first: "$offerDescription" },
          outlets: { $push: "$outletDetails" },
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Offer found",
      error: null,
      data: offers,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Offer by location", error.message, error);

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
