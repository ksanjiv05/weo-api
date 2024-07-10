// Objective: write the functions that will be used in the routes of the brand
// Author: Sanjiv Kumar Pandit (ksanjiv0005@gamil.com)

// Import necessary modules
import { Request, Response } from "express";
import Brand, { IBrand } from "../../../models/brand.model";
import logging from "../../../config/logging";
import { validationResult } from "express-validator";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import { IRequest } from "../../../interfaces/IRequest";
import outletModel from "../../../models/outlet.model";
import { STATUS } from "../../../config/enums";

// Define the functions

// Function to add the brand
export const addBrand = async (req: IRequest, res: Response) => {
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

    const { user } = req;
    // console.log("user", user);
    const brand: IBrand = {
      user: user._id,
      ...req.body,
    };

    const newBrand = new Brand(brand);

    await newBrand.save();

    if (!newBrand) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Brand not saved",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Brand added successfully",
      error: null,
      data: newBrand,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Add new Brand", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brand not saved",
      error:
        error.message && error.message.includes("E11000")
          ? "Brand name already exists"
          : error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get all brands
export const getBrands = async (req: IRequest, res: Response) => {
  try {
    //pagination
    const { page = 1, perPage = 10, status = STATUS.LIVE } = req.query;
    const user = req.user;
    // if (!user?.admin) {
    //   return responseObj({
    //     resObj: res,
    //     type: "error",
    //     statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
    //     msg: "you are not allowed to get Brands",
    //     error: "you are not allowed to get Brands",
    //     data: null,
    //     code: ERROR_CODES.AUTH_ERR,
    //   });
    // }

    const skip = (Number(page) - 1) * Number(perPage);

    const filter = {
      ...{ status: parseInt(status.toString()) },
      ...(!user.admin && { user: user._id }),
    };

    // const brands = await Brand.find(filter)
    //   .sort("createdAt")
    //   .skip(skip)
    //   .limit(Number(perPage));
    // const total = await Brand.countDocuments(filter);

    // brands with there outlets
    const brands = await Brand.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "outlets",
          localField: "_id",
          foreignField: "brand",
          as: "outlets",
        },
      },
      {
        $project: {
          brandName: 1,
          brandDescription: 1,
          categoryId: 1,
          brandLogo: 1,
          checkpoint: 1,
          outlets: 1,
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "All brands",
      error: null,
      data: { brands, total: brands.length },
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get all brands", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brands not found",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get brand by id
export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Brand not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Brand found",
      error: null,
      data: brand,
    });
  } catch (error: any) {
    logging.error("Get brand by id", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brand not found",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get brand by id
export const getBrandByName = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;
    const { name } = req.params;
    const brand = await Brand.findById({ brandName: name, user: _id });

    if (!brand) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Brand not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Brand found",
      error: null,
      data: brand,
    });
  } catch (error: any) {
    logging.error("Get brand by name", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brand not found",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to update the brand
export const updateBrand = async (req: Request, res: Response) => {
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

    const brand = await Brand.findByIdAndUpdate(id, req.body, {
      new: false,
    });

    if (!brand) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Brand not updated",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Brand updated",
      error: null,
      data: brand,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Update brand", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brand not updated",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to delete the brand
export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Brand not deleted",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Brand deleted",
      error: null,
      data: brand,
    });
  } catch (error: any) {
    logging.error("Delete brand", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brand not deleted",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const deleteBrands = async (req: Request, res: Response) => {
  const session = await Brand.startSession();
  session.startTransaction();
  try {
    const ids = Object.values(req.query);

    if (ids.length < 0) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "please provide valid offer ids",
        error: "please provide valid offer ids",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_ERR,
      });
    }

    console.log("ids ", ids);

    await Brand.deleteMany(
      {
        _id: { $in: ids },
        status: STATUS.PENDING,
      },
      { session }
    );
    await outletModel.deleteMany(
      {
        brand: { $in: ids },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Brands deleted successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
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

// Function to get all brands by user id

export const getBrandsByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const brands = await Brand.find({ user: id });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "All brands by user id",
      error: null,
      data: brands,
    });
  } catch (error: any) {
    logging.error("Get all brands by user id", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Brands not found",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get all brands by nearby user location within 10 km with pagination

export const getBrandsByLocation = async (req: Request, res: Response) => {
  try {
    const {
      userLatitude,
      userLongitude,
      maxDistance,
      status = STATUS.LIVE,
    }: any = req.query;

    if (!userLatitude || !userLongitude) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "userLatitude and userLongitude are required",
        error: "userLatitude and userLongitude are required",
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    const lat = parseFloat(userLongitude);
    const lng = parseFloat(userLatitude);

    const brands = await outletModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance",
          maxDistance: maxDistance ? parseInt(maxDistance) : 10000,
          spherical: true,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandDetails",
          pipeline: [{ $match: { status: status } }],
        },
      },
      {
        $unwind: "$brandDetails",
      },
      {
        $group: {
          _id: "$brand",
          brandName: { $first: "$brandDetails.brandName" },
          brandDescription: { $first: "$brandDetails.brandDescription" },
          brandLogo: { $first: "$brandDetails.brandLogo" },
          outlets: { $push: "$$ROOT" },
        },
      },
    ]);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "brands",
      error: null,
      data: brands,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Brands by location", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "brands not found",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
