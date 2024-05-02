// Objective : Define the Outlet functions that will be used in the routes
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

// Import necessary modules
import { Request, Response } from "express";
import Outlet, { IOutlet } from "../../../models/outlet.model";
import logging from "../../../config/logging";
import { validationResult } from "express-validator";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";

// Define the functions

// Function to add the outlet
export const addOutlet = async (req: Request, res: Response) => {
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

    const outlets: IOutlet[] = req.body;

    // await Outlet.bulkWrite(
    //   outlets.map((outlet) => {
    //     const newOutlet = new Outlet(outlet);
    //     return {
    //       insertOne: {
    //         document: newOutlet,
    //       },
    //     };
    //   })
    // );

    await Outlet.insertMany(outlets);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Outlet added successfully",
      error: null,
      data: null,
    });
  } catch (error: any) {
    logging.error("Outlet Add", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Internal server error",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
