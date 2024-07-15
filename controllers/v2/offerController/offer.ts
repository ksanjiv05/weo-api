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
import { IRequest } from "../../../interfaces/IRequest";
import mongoose from "mongoose";
import { KeyProps, deleteS3Files } from "../../../helper/aws";
import outletModel from "../../../models/outlet.model";

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
      error: error.message || "internal server error",
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
        error: error.message || "internal server error",
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
      error: error.message || "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const updateOfferData = async (req: Request, res: Response) => {
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

    const { id } = req.params;
    if (!id) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "offer id is required",
        error: errors.array({}),
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const { status } = req.body;

    if (status === STATUS.LIVE) {
      addOfferDataPoints(req, res);
      return;
    }

    const offer = await OfferData.updateOne(
      { _id: id },
      {
        $set: {
          ...req.body,
        },
      },
      {
        session,
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
        },
        {
          session,
        }
      );
    }

    await Offer.updateOne(
      { _id: req.body?.offerId },
      {
        $set: {
          checkpoint: req.body?.checkpoint,
        },
      },
      {
        session,
      }
    );

    await session.commitTransaction();
    session.endSession();

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
    await session.abortTransaction();
    session.endSession();
    logging.error("Update Offer Data", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message || "internal server error",
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
      error: error.message || "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

//
export const toListOffer = async (req: IRequest, res: Response) => {
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
      error: error.message || "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the offer
export const getOffers = async (req: IRequest, res: Response) => {
  try {
    const {
      offerStatus = OFFER_STATUS.LIVE,
      page = 1,
      perPage = 10,
      brandId = null,
      outlets = [],
    } = req.query;
    const { _id } = req.user;
    console.log("requset", req.query);

    const skip = (Number(page) - 1) * Number(perPage);

    const filter = {
      user: _id,
      offerStatus,
      ...(brandId && { brand: brandId }),
      ...(outlets && { outlets: { $in: outlets } }),
    };

    const offer = await Offer.find(filter)
      .sort({ createdAt: -1 })
      .populate("brand", "brandName brandLogo")
      .populate({
        path: "offerDataPoints",
        populate: { path: "offerData" },
      })
      .skip(Number(skip))
      .limit(Number(perPage))
      .exec();

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
      error: error.message || "internal server error",
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
      error: error.message || "internal server error",
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
      error: error.message || "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const deleteOffer = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: offerId } = req.params;

    const offerData = await OfferData.findOne({ offerId });

    if (offerData) {
      const deletedMediaStatus = await deleteS3Files(
        offerData.offerMedia?.map(({ mediaUrl }) => ({ Key: mediaUrl }))
      );
      if (deletedMediaStatus) {
        await OfferData.deleteOne({ offerId }, { session });
        await Offer.deleteOne({ _id: offerId }, { session });

        await session.commitTransaction();
        session.endSession();
      }
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
    await session.abortTransaction();
    session.endSession();

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message || "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const deleteOffers = async (req: Request, res: Response) => {
  const session = await Offer.startSession();
  session.startTransaction();
  try {
    const ids = Object.values(req.query);

    const offerData = await OfferData.find({ offerId: { $in: ids } });
    console.log("delete", ids);
    if (offerData.length > 0) {
      console.log("offerData", offerData);
      const keys = offerData
        .flatMap(
          (offer) =>
            offer.offerMedia?.map((file) => ({
              Key: file.mediaUrl.split("/").slice(3).join("/"),
            })) || []
        )
        .concat(
          offerData[0].offerThumbnail !== ""
            ? {
                Key: offerData[0].offerThumbnail.split("/").slice(3).join("/"),
              }
            : []
        );

      console.log("deletedMediaStatus", keys);
      const deletedMediaStatus = await deleteS3Files(keys);

      if (deletedMediaStatus) {
        await Offer.deleteMany(
          { _id: { $in: ids }, offerStatus: OFFER_STATUS.PENDING },
          { session }
        );
        await OfferData.deleteMany({ offerId: { $in: ids } }, { session });

        await session.commitTransaction();
        session.endSession();

        return responseObj({
          resObj: res,
          type: "success",
          statusCode: HTTP_STATUS_CODES.SUCCESS,
          msg: "Offers deleted successfully",
          error: null,
          data: null,
          code: ERROR_CODES.SUCCESS,
        });
      }
    }

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      msg: "please provide valid offer ids",
      error: "please provide valid offer ids",
      data: null,
      code: ERROR_CODES.FIELD_VALIDATION_ERR,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logging.error("Delete Offers", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message || "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the offers by user location
export const getOffersByLocation = async (req: Request, res: Response) => {
  try {
    const {
      userLatitude,
      userLongitude,
      maxDistance,
      queryString = "",
    }: any = req.query;

    const keywords = queryString
      .split(" ")
      .map((word: string) => new RegExp(word, "i"));
    const lat = parseFloat(userLongitude);
    const lng = parseFloat(userLatitude);

    // const offers = await Offer.aggregate([
    //   {
    //     $lookup: {
    //       from: "outlets",
    //       localField: "outlets",
    //       foreignField: "_id",
    //       as: "outletDetails",
    //     },
    //   },
    //   {
    //     $unwind: "$outletDetails",
    //   },
    //   {
    //     // $match: {
    //     //   "outletDetails.location.coordinates": {
    //     // $nearSphere: {
    //     //   $geometry: {
    //     //     type: "Point",
    //     //     coordinates: [userLongitude, userLatitude],
    //     //   },
    //     //   $maxDistance: maxDistance,
    //     // },

    //     $geoNear: {
    //       near: {
    //         type: "Point",
    //         coordinates: [lng, lat],
    //       },
    //       // distanceField: "distance",
    //       // maxDistance: maxDistance ? parseInt(maxDistance) : 10000,
    //       // spherical: true,
    //       distanceField: "dist.calculated",
    //       maxDistance: 10000,
    //       query: { isEnabled: true },
    //     },
    //     // },
    //     // },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       offerName: { $first: "$offerName" },
    //       offerDescription: { $first: "$offerDescription" },
    //       outlets: { $push: "$outletDetails" },
    //     },
    //   },
    // ]);

    console.log("lat", lat, "lng", lng);

    const offers = await outletModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          // distanceField: "distance",
          distanceField: "dist.calculated",
          spherical: true,
          maxDistance: 10000,
        },
      },
      {
        $lookup: {
          from: "offers",
          let: { outlet_id: "$_id" },
          pipeline: [
            {
              $match: {
                // offerName:"Sdfgsdfg"
                outlets: {
                  $in: ["$$outlet_id"], //6673e16fbadb00687e3a64cd
                  // $in: [ObjectId("6673e16fbadb00687e3a64cd")],
                },
                // offerName:"Poco f1"
                // $text: { $search: "Poco Asdfasd" },
              },
            },
          ],
          as: "result",
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
      error: error.message || "internal server error",
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

//"https://weo-media-bucket.s3.amazonaws.com/offers/AsRYLjNCLyeWvvAykGofBNrPdQG2/AsRYLjNCLyeWvvAykGofBNrPdQG26673e067d6d45807903b36546673fc62f51bf45cbcac8d8b0.jpg".split("/").splice(3).join("/")
