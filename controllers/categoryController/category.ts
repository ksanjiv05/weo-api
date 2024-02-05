import { Request, Response } from "express";
import logging from "../../config/logging";
import Category from "../../models/Category";
import { ICategory } from "../../interfaces/ICategory";
import { responseObj } from "../../helper/response";
import { HTTP_STATUS_CODES } from "../../config/statusCode";
import User from "../../models/User";
import { ERROR_CODES } from "../../config/errorCode";

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { categoryTitle = "", categoryPic = "" }: ICategory = req.body;

    if (categoryTitle === "" || categoryTitle === "")
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Please provide category title and ",
        error: null,
        data: null,
      });

    const newCategory = new Category(req.body);
    await newCategory.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added Category",
      error: null,
      data: newCategory,
    });
  } catch (error: any) {
    logging.error("Category", "unable to add Category", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add Category",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { _id = "" } = req.body;
    if (_id == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid mongo Category ID",
        error: null,
        resObj: res,
        data: null,
      });

    await Category.updateOne(
      { _id },
      {
        ...req.body,
      }
    );
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your Category has been updated",
      error: null,
      resObj: res,
      data: null,
    });
  } catch (error: any) {
    logging.error("Update Category", "unable to update Category", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to update Category",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { _id = "" } = req.query;
    if (_id == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid mongo Category ID",
        error: null,
        resObj: res,
        data: null,
      });
    const category = await Category.findOne({ _id });
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your Category",
      error: null,
      resObj: res,
      data: category,
    });
  } catch (error: any) {
    logging.error("Get Category", "unable to get Category profile", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Category profile",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your Categories",
      error: null,
      resObj: res,
      data: categories,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Categories", "unable to get Categories", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get Categories",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  return res.status(201).send("Not implemented");
};
