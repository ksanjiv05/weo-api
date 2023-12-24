import { Request, Response } from "express";
import logging from "../../config/logging";
import Offer from "../../models/Offer";
import { IOffer } from "../../interfaces/IOffer";
import { responseObj } from "../../helper/response";
import { HTTP_STATUS_CODES } from "../../config/statusCode";
import { validationResult } from "express-validator";

export const addOffer = async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);
    const errors = validationResult(req);
    // if there is error then return Error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array({}),
      });
    }
    // const { uid = "" } = req.body;
    // req.body.creatorId = uid;

    const newOffer = new Offer(req.body);

    await newOffer.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added Offer",
      error: null,
      data: newOffer,
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
    });
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    // console.log("errors", req.body);
    // if there is error then return Error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array({}),
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
      });
    }

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
    });
  }
};

export const getOffers = async (req: Request, res: Response) => {
  try {
    const {
      page = 0,
      perPage = 10,
      offerStatus = "",
      minAccessBalance = -1,
      offerActivitiesAt = "",
    } = req.query;
    req.body.creatorId = req.body.uid;

    const skip = (Number(page) - 1) * Number(perPage);
    const filter = {
      ...(offerStatus === "DEPARTMENT.UNKNOWN" ? {} : { offerStatus }),
      // ...(minAccessBalance === -1 ? {} : { minAccessBalance }),
      ...(offerActivitiesAt === "" ? {} : { offerActivitiesAt }),

      // ...(tableId === "" ? {} : { tableIds: { $elemMatch: { tableId } } }),
    };

    const offers = await Offer.find({})
      .sort("-createdAt")
      .skip(Number(skip))
      .limit(Number(perPage));
    const total = await Offer.find(filter).count();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "all offers",
      error: null,
      data: offers,
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
    });
  }
};

export const getOffer = async (req: Request, res: Response) => {
  try {
    const { id = "" } = req.params;

    const offer = await Offer.findOne({ _id: id });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "your offer",
      error: null,
      data: offer,
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
    });
  }
};

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
    });
  }
};
