// Objective : Define the Address functions that will be used in the routes
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

// Import necessary modules
import { Request, Response } from "express";
import Address, { IAddress } from "../../../models/address.model";
import logging from "../../../config/logging";
import { validationResult } from "express-validator";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";

// Define the functions

// Function to add the address
export const addAddress = async (req: Request, res: Response) => {
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

    const { user, longitude, latitude } = req.body;

    const address: IAddress = {
      user: user._id,
      ...req.body,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };

    const newAddress = addNewAddress(address);

    if (!newAddress) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Address not saved",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Address saved successfully",
      error: null,
      data: newAddress,
      code: null,
    });
  } catch (error: any) {
    logging.error("Add New Address", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Address not saved",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const addNewAddress = async (address: IAddress) => {
  try {
    const newAddress = new Address(address);
    const result = await newAddress.save();
    return result;
  } catch (error: any) {
    logging.error("Add New Address", error.message, error);
    return null;
  }
};

// Function to get the address by user
export const getAddress = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    const address = await Address.find({ user: user._id });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Address fetched successfully",
      error: null,
      data: address,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Address", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Address not fetched",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to update the address
export const updateAddress = async (req: Request, res: Response) => {
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

    const { user, longitude, latitude } = req.body;

    const address: IAddress = {
      user: user._id,
      ...req.body,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      address,
      { new: true }
    );

    if (!updatedAddress) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Address not updated",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Address updated successfully",
      error: null,
      data: updatedAddress,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Update Address", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Address not updated",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to delete the address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const deletedAddress = await Address.findByIdAndDelete(req.params.id);

    if (!deletedAddress) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Address not deleted",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Address deleted successfully",
      error: null,
      data: deletedAddress,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Delete Address", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Address not deleted",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the address by id
export const getAddressById = async (req: Request, res: Response) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Address not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Address fetched successfully",
      error: null,
      data: address,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Address By Id", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Address not fetched",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the address by address ids
export const getAddressByAddressIds = async (req: Request, res: Response) => {
  try {
    const { addressIds } = req.body;
    const address = await Address.find({ _id: { $in: addressIds } });

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Address fetched successfully",
      error: null,
      data: address,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Address By Address Ids", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Address not fetched",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
