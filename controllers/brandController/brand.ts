import { Request, Response } from "express";
import logging from "../../config/logging";
import Brand from "../../models/Brand";
import { IBrand } from "../../interfaces/IBrand";
import { responseObj } from "../../helper/response";
import { HTTP_STATUS_CODES } from "../../config/statusCode";
import { validationResult } from "express-validator";

export const addBrand = async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array({}),
      });
    }
    // const { uid = "" } = req.body;
    // req.body.creatorId = uid;

    const newBrand = new Brand(req.body);
    await newBrand.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added Brand",
      error: null,
      data: newBrand,
    });
  } catch (error: any) {
    logging.error("Brand", "unable to add Brand", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add Brand",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array({}),
      });
    }
    const { _id = "", checkpoint = 1 } = req.body;
    if ((checkpoint === 1 && !_id) || _id == "") {
      const newBrand = new Brand(req.body);
      await newBrand.save();

      return responseObj({
        resObj: res,
        type: "success",
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        msg: "you are successfully added Offer",
        error: null,
        data: newBrand,
      });
    }
    await Brand.updateOne({ _id }, { ...req.body });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added Brand",
      error: null,
      data: null,
    });
  } catch (error: any) {
    logging.error("Brand", "unable to add Brand", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add Brand",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};
