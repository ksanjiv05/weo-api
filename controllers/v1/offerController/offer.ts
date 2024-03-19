import { Request, Response } from "express";
import logging from "../../../config/logging";
import Offer from "../../../models/Offer";
import { IOffer, OFFER_STATUS } from "../../../interfaces/IOffer";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { validationResult } from "express-validator";
import { ERROR_CODES } from "../../../config/errorCode";
import mongoose from "mongoose";
import { exportCsv } from "../../../helper/csvUtils";

// this function is used to check if the offer name is already exist or not
export const isOfferNameExist = async (req: Request, res: Response) => {
  try {
    const { offerTitle = "", brandId = "" } = req.query;
    const { uid = "" } = req.body;
    if (brandId == "" || offerTitle == null) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "please provide offer name and brandId",
        error: "please provide offer name and brandId",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const offer = await Offer.findOne({ brandId, offerTitle });
    if (offer) {
      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "Offer name already exist",
        error: null,
        data: null,
        code: ERROR_CODES.DUPLICATE,
      });
    }
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Offer name is available",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Offer Exist", "unable to check offer exist or not", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to check offer exist or not",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// this function is used to add new offer
export const addOffer = async (req: Request, res: Response) => {
  try {
    // console.log("req.body", req.body);
    const errors = validationResult(req);
    // if there is error then return Error
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
    // const { uid = "" } = req.body;
    req.body.creatorId = req.body.uid;

    const newOffer = new Offer(req.body);

    await newOffer.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added Offer",
      error: null,
      data: newOffer,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Offer", "unable to add Offer", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add Offer",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// this function is used to update offer
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    // console.log("errors", req.body);
    // if there is error then return Error
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
    const { _id = "", checkpoint = 1 } = req.body;

    if ((checkpoint === 1 && !_id) || _id == "") {
      const newOffer = new Offer(req.body);

      await newOffer.save();

      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "you are successfully added Offer",
        error: null,
        data: newOffer,
        code: ERROR_CODES.SUCCESS,
      });
    }

    req.body.totalOffersSold =
      req.body.totalOffersSold > 0 ? req.body.totalOffersSold : 0;

    const offerStatus = await Offer.updateOne({ _id }, { ...req.body });

    console.log("offerStatus", offerStatus);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added Offer",
      error: null,
      data: {
        ...req.body,
      },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Offer", "unable to add Offer", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add Offer",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// this function is used to get all offers
export const getOffers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      perPage = 10,
      subCategoryName = "",
      minAccessBalance = -1,
      offerActivitiesAt = "",
      offerStatus = OFFER_STATUS.LIVE,
    } = req.query;
    req.body.creatorId = req.body.uid;
    const { admin = false } = req.body;

    const skip = (Number(page) - 1) * Number(perPage);

    const filter = {
      ...{ offerStatus: admin ? offerStatus : OFFER_STATUS.LIVE },
      totalOffersAvailable: { $gt: 0 },
      ...(subCategoryName === ""
        ? {}
        : { subCategories: { $elemMatch: { subCategoryName } } }),
      // ...(minAccessBalance === -1 ? {} : { minAccessBalance }),
      ...(offerActivitiesAt === "" ? {} : { offerActivitiesAt }),
      ...(admin
        ? {}
        : {
            offerValidityStartDate: { $lte: new Date() },
            offerValidityEndDate: { $gte: new Date() },
          }),
    };

    // const offers = await Offer.find(
    //   {
    //     ...filter,
    //   },
    //   {
    //     creatorId: 1,
    //     offerTitle: 1,
    //     offerStatus: 1,
    //     createdAt: 1,
    //     updatedAt: 1,
    //     brandName: 1,
    //     brandId: 1,
    //     offerMedia: 1,
    //     offerThumbnailImage: 1,
    //     offerPriceAmount: 1,
    //     totalOffersSold: 1,
    //     totalOffersAvailable: 1,
    //     serviceUnitName: 1,
    //     totalServiceUnitItems: 1,
    //     durationUnitItems: 1,
    //     durationUnitType: 1,
    //   }
    // )
    //   .sort("-createdAt")
    //   .skip(Number(skip))
    //   .limit(Number(perPage));

    console.log("filter", admin, req.body, filter);

    const offers = await Offer.aggregate([
      {
        $match: {
          ...filter,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "uid",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          creatorId: 1,
          offerTitle: 1,
          offerDescription: 1,
          offerStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          creatorName: "$user.creatorName",
          brandId: 1,
          offerMedia: 1,
          offerThumbnailImage: 1,
          offerPriceAmount: 1,
          totalOffersSold: 1,
          totalOffersAvailable: 1,
          serviceUnitName: 1,
          totalServiceUnitItems: 1,
          durationUnitItems: 1,
          durationUnitType: 1,
          durationName: 1,
          brandName: 1,
        },
      },
      { $skip: Number(skip) }, // Skip documents for pagination
      { $limit: Number(perPage) }, // Limit the number of documents for pagination
    ]);

    // console.log("offers", offer);

    const total = await Offer.find(filter).count();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "all offers",
      error: null,
      data: { offers, total },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Offers", "unable to get Offers", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Offers",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// this function is used to get all offers by uid
export const getOffersByUid = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      perPage = 10,
      offerStatus = OFFER_STATUS.UNKNOWN,
      minAccessBalance = -1,
      offerActivitiesAt = "",
    } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);
    const filter = {
      ...(offerStatus === OFFER_STATUS.UNKNOWN ? {} : { offerStatus }),
      // ...(minAccessBalance === -1 ? {} : { minAccessBalance }),
      ...(offerActivitiesAt === "" ? {} : { offerActivitiesAt }),
      // ...(tableId === "" ? {} : { tableIds: { $elemMatch: { tableId } } }),
      creatorId: req.body.uid,
    };

    const offers = await Offer.find(filter, {
      creatorId: 1,
      offerTitle: 1,
      offerDescription: 1,
      offerStatus: 1,
      createdAt: 1,
      updatedAt: 1,
      brandName: 1,
      brandId: 1,
      offerThumbnailImage: 1,
      offerPriceAmount: 1,
      totalOffersSold: 1,
      totalOffersAvailable: 1,
      durationName: 1,
    })
      .sort("-createdAt")
      .skip(Number(skip))
      .limit(Number(perPage));
    const total = await Offer.find({
      creatorId: req.body.uid,
      offerStatus,
    }).count();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "all offers",
      error: null,
      data: { offers, total },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Offers", "unable to get Offers", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Offers",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// this function is used to get offer by id
export const getOffer = async (req: Request, res: Response) => {
  try {
    const { id = "" } = req.params;
    const { location = false } = req.query;
    if (id == "") {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "please provide offer id",
        error: "please provide offer id",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }

    let offer = null;
    if (location || location === "true") {
      const offers = await Offer.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        // {
        //   $project: {
        //     brandId: {
        //       $toObjectId: "$brandId",
        //     },
        //   },
        // },
        { $addFields: { brandIdObi: { $toObjectId: "$brandId" } } },

        {
          $lookup: {
            from: "brands",
            localField: "brandIdObi",
            foreignField: "_id",
            as: "brand",
          },
        },
        {
          $unwind: "$brand",
        },
        {
          $addFields: {
            onlineStore: "$brand.onlineLocations",
            offlineStore: "$brand.offlineLocations",
          },
        },

        {
          $project: {
            brand: 0,
            // offerData: "$$ROOT",
          },
        },
      ]);
      offer = offers[0] || null;
    } else {
      offer = await Offer.findOne({ _id: id });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "your offer",
      error: null,
      data: offer,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Offer", "unable to get Offers", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Offer",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// this function is used to delete offer by id
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id = "" } = req.params;

    await Offer.deleteOne({ _id: id, creatorId: req.body.uid });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "your offer deleted successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Delete Offer", "unable to get Offers", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to delete Offer",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const getOfferCsv = async (req: Request, res: Response) => {
  try {
    const {
      offerStatus = OFFER_STATUS.UNKNOWN,
      totalOffersAvailable = -1,
      subCategoryName = "",
      offerActivitiesAt = "",
    } = req.query;
    // const offers = await Offer.find({}).lean();
    if (!req.body.admin) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
        msg: "you are not allowed to get csv file",
        error: "you are not allowed to get csv file",
        data: null,
        code: ERROR_CODES.AUTH_ERR,
      });
    }
    const filter = {
      ...{ offerStatus: OFFER_STATUS.UNKNOWN ? {} : { offerStatus } },
      ...(totalOffersAvailable != -1
        ? {}
        : {
            $gt: totalOffersAvailable,
          }),
      ...(subCategoryName === ""
        ? {}
        : { subCategories: { $elemMatch: { subCategoryName } } }),
      // ...(minAccessBalance === -1 ? {} : { minAccessBalance }),
      ...(offerActivitiesAt === "" ? {} : { offerActivitiesAt }),
      ...(req.body.admin
        ? {}
        : {
            offerValidityStartDate: { $lte: new Date() },
            offerValidityEndDate: { $gte: new Date() },
          }),
    };

    // const offers = await Offer.aggregate([
    //   {
    //     $match: {
    //       ...filter,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "creatorId",
    //       foreignField: "uid",
    //       as: "user",
    //     },
    //   },
    //   {
    //     $unwind: "$user",
    //   },
    //   {
    //     $project: {
    //       creatorId: 1,
    //       offerTitle: 1,
    //       offerDescription: 1,
    //       offerStatus: 1,
    //       createdAt: 1,
    //       updatedAt: 1,
    //       creatorName: "$user.creatorName",
    //       brandId: 1,
    //       offerMedia: 1,
    //       offerThumbnailImage: 1,
    //       offerPriceAmount: 1,
    //       totalOffersSold: 1,
    //       totalOffersAvailable: 1,
    //       serviceUnitName: 1,
    //       totalServiceUnitItems: 1,
    //       durationUnitItems: 1,
    //       durationUnitType: 1,
    //       durationName: 1,
    //       brandName: 1,
    //     },
    //   },
    //   { $skip: Number(skip) }, // Skip documents for pagination
    //   { $limit: Number(perPage) }, // Limit the number of documents for pagination
    // ]);
    const offers = await Offer.find(filter).lean();
    exportCsv(offers, "offers", res);
  } catch (error: any) {
    logging.error("Get CSV Offer", "unable to get Offers", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get csv file",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
