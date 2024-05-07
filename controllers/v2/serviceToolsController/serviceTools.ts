// Objective : Define the Service Tool functions that will be used in the routes
// Author : Sanjiv Kumar Pandit

// Import necessary modules
import { Request, Response } from "express";
import ServiceTool, { IServiceTool } from "../../../models/service.tool.model";
import logging from "../../../config/logging";
import { validationResult } from "express-validator";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";

// Define the functions

// Function to add the service tool
export const addServiceTool = async (req: Request, res: Response) => {
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

    const serviceTool: IServiceTool = req.body;

    const newServiceTool = new ServiceTool(serviceTool);

    await newServiceTool.save();

    if (!newServiceTool) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Service Tool not saved",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Service Tool added successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Service Tool Add", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Service Tool not saved",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to update the service tool

export const updateServiceTool = async (req: Request, res: Response) => {
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

    const serviceTool: IServiceTool = req.body;

    const updatedServiceTool = await ServiceTool.findByIdAndUpdate(
      req.params.id,
      serviceTool,
      { new: false }
    );

    if (!updatedServiceTool) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        msg: "Service Tool not updated",
        error: null,
        data: null,
        code: ERROR_CODES.SERVER_ERR,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "Service Tool updated successfully",
      error: null,
      data: updatedServiceTool,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Service Tool Update", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Service Tool not updated",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get the service tool by id
export const getServiceToolById = async (req: Request, res: Response) => {
  try {
    const serviceTool = await ServiceTool.findById(req.params.id);

    if (!serviceTool) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Service Tool not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Service Tool found",
      error: null,
      data: serviceTool,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Service Tool Get", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Service Tool not found",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to get all service tools

export const getServiceTools = async (req: Request, res: Response) => {
  try {
    const serviceTools = await ServiceTool.find();

    if (!serviceTools) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Service Tools not found",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "All service tools",
      error: null,
      data: serviceTools,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get all service tools", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Service Tools not found",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

// Function to delete the service tool

export const deleteServiceTool = async (req: Request, res: Response) => {
  try {
    const serviceTool = await ServiceTool.findByIdAndDelete(req.params.id);

    if (!serviceTool) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        msg: "Service Tool not deleted",
        error: null,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "Service Tool deleted successfully",
      error: null,
      data: null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Service Tool Delete", error.message, error);

    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "Service Tool not deleted",
      error: error.message,
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};
