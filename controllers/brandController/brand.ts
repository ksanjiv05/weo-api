import { Request, Response } from "express";
import logging from "../../config/logging";
import Brand from "../../models/Brand";
import { BRAND_STATUS, IBrand } from "../../interfaces/IBrand";
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

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await Brand.find({});

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully get Brands",
      error: null,
      data: brands,
    });
  } catch (error: any) {
    logging.error("Brand", "unable to get Brands", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Brands",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const getBrandsByUid = async (req: Request, res: Response) => {
  try {
    const { page = 1, perPage = 10, status = BRAND_STATUS.UNKNOWN } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);
    const filter = {
      ...(status === BRAND_STATUS.UNKNOWN ? {} : { status }),
      // ...(minAccessBalance === -1 ? {} : { minAccessBalance }),
      uid: req.body.uid,
    };
    const brands = await Brand.find(filter)
      .sort("-createdAt")
      .skip(Number(skip))
      .limit(Number(perPage));
    const total = await Brand.find(filter).count();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully get Brands",
      error: null,
      data: { brands, total },
    });
  } catch (error: any) {
    logging.error("Brand", "unable to get Brands", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Brands",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const getBrand = async (req: Request, res: Response) => {
  try {
    const { brandId = "" } = req.params;
    if (brandId == "") {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "please provide brandId",
        error: "please provide brandId",
        data: null,
      });
    }
    const brand = await Brand.findOne({ _id: brandId });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully get Brand",
      error: null,
      data: brand,
    });
  } catch (error: any) {
    logging.error("Brand", "unable to get Brand", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Brand",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { brandId = "" } = req.params;
    if (brandId == "") {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "please provide brandId",
        error: "please provide brandId",
        data: null,
      });
    }
    await Brand.deleteOne({ _id: brandId });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully deleted Brand",
      error: null,
      data: null,
    });
  } catch (error: any) {
    logging.error("Brand", "unable to delete Brand", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to delete Brand",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};
