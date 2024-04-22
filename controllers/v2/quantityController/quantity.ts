import { Request, Response } from "express";
import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import Quantity from "../../../models/Quantity";
import { ERROR_CODES } from "../../../config/errorCode";

export const createQuantity = async (req: Request, res: Response) => {
  try {
    const { name = "" } = req.body;
    if (name === "") {
      responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Please provide  name of quantity",
        error: null,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }

    const newQuantity = new Quantity(req.body);
    await newQuantity.save();
    responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Quantity created successfully",
      error: null,
      data: newQuantity,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Quantity", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to create Quantity",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const getQuantities = async (req: Request, res: Response) => {
  try {
    const { page = 1, perPage = 10, name = "", all = false } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);
    const quantities = (await all)
      ? Quantity.find()
      : Quantity.find().skip(skip).limit(Number(perPage));
    responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Quantities fetched successfully",
      error: null,
      data: quantities,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Quantity", error.message, error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to fetch Quantities",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
