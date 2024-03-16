import { Request, Response } from "express";
import logging from "../../../config/logging";
import Address from "../../../models/Address";
import { IAddress } from "../../../interfaces/IAddress";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import User from "../../../models/User";
import { validationResult } from "express-validator";

export const addAddress = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array({}),
      });
    }
    const { uid } = req.body;
    const newAddress = new Address(req.body);
    await newAddress.save();
    await User.updateOne(
      { uid },
      {
        $addToSet: {
          address: newAddress._id,
        },
      }
    );

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added address",
      error: null,
      data: newAddress,
    });
  } catch (error: any) {
    logging.error("Address", "unable to add Address", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add Address",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { _id = "" } = req.body;
    if (_id == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid mongo Address ID",
        error: null,
        resObj: res,
        data: null,
      });

    await Address.updateOne(
      { _id },
      {
        ...req.body,
      }
    );
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your address has been updated",
      error: null,
      resObj: res,
      data: null,
    });
  } catch (error: any) {
    logging.error("Update Address", "unable to update Address", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to update Address",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const getAddress = async (req: Request, res: Response) => {
  try {
    const { uid = "" } = req.body;
    if (uid == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid mongo Address ID",
        error: null,
        resObj: res,
        data: null,
      });
    const address = await Address.findOne({ uid });
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your address",
      error: null,
      resObj: res,
      data: address,
    });
  } catch (error: any) {
    logging.error("Get Address", "unable to get Address profile", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Address profile",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  return res.status(201).send("Not implemented");
};
