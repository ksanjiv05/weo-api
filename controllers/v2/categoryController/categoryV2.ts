import { Request, Response } from "express";
import logging from "../../../config/logging";
import Category from "../../../models/CategoryV2";
import { ICategoryV2 } from "../../../interfaces/ICategory";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { ERROR_CODES } from "../../../config/errorCode";
import Brand from "../../../models/Brand";
import mongoose from "mongoose";
import { STATIC_FILE_PATH } from "../../../config/config";

export const addCategory = async (req: Request, res: Response) => {
  try {
    const {
      name = "",
      parentCategoryId = "",
      categoryPic = "",
      _id = "",
    }: ICategoryV2 = req.body;
    // const file = req.file;
    // console.log(
    //   "file",
    //   req.body,
    //   file,
    //   parentCategoryId,
    //   parentCategoryId !== ""
    // );
    // if (file) {
    //   req.body.categoryPic = file.filename;
    // }
    if (name === "")
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Please provide category name and ",
        error: null,
        data: null,
      });
    if (parentCategoryId !== "" && _id === "") {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Please provide category id for add subcategory",
        error: null,
        data: null,
      });
    }
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
    if (!category)
      return responseObj({
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        type: "error",
        msg: "Category not found",
        error: null,
        resObj: res,
        data: null,
      });
    category.categoryPic =
      STATIC_FILE_PATH + "category/" + category.categoryPic;
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
    const { page = 1, perPage = 10, name = "" } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);

    const filter = {
      ...(name === ""
        ? {}
        : {
            name: { $regex: new RegExp(name.toString(), "i") },
          }),
      // {
      //     $text: {
      //       $search: name + "",
      //     },
      //   }),
    };
    let categories = await Category.find(filter)
      .sort("-createdAt")
      .skip(Number(skip))
      .limit(Number(perPage));
    const total = await Category.find(filter).count();

    categories.map((category) => {
      category.categoryPic =
        STATIC_FILE_PATH + "category/" + category.categoryPic;
    });
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your Categories",
      error: null,
      resObj: res,
      data: { categories, total },
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

export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const { id = "" } = req.params;

    // const skip = (Number(page) - 1) * Number(perPage);

    const filter = {
      parentCategoryId: id,
      // ...(name === ""
      //   ? {}
      //   : {
      //       name: { $regex: new RegExp(name.toString(), "i") },
      //     }),
      // {
      //     $text: {
      //       $search: name + "",
      //     },
      //   }),
    };

    const categories = await Category.find(filter);
    categories.map((category) => {
      category.categoryPic =
        STATIC_FILE_PATH + "category/" + category.categoryPic;
    });
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your Categories",
      error: null,
      resObj: res,
      data: { sub_categories: categories },
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
export const getSubAllCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const filter = {
      parentCategoryId: { $ne: null },
    };
    const skip = (Number(page) - 1) * Number(perPage);
    const categories = await Category.find(filter)
      .sort("-createdAt")
      .skip(Number(skip))
      .limit(Number(perPage));
    const total = await Category.find(filter).count();

    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your Categories",
      error: null,
      resObj: res,
      data: { sub_categories: categories, total },
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

//

export const getBrandSubCategories = async (req: Request, res: Response) => {
  try {
    const { id = "" } = req.params;
    const filter = {
      parentCategoryId: id,
    };

    const categories = await Brand.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoriesIds",
          foreignField: "_id",
          as: "brandCategories",
        },
      },
      // {
      //   $unwind: "$brandCategories",
      // },
      // {
      //   $lookup: {
      //     from: "categories",
      //     localField: "brandCategories.parentCategoryId",
      // }
      // }
    ]);

    console.log("br", categories);
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your Categories",
      error: null,
      resObj: res,
      data: { sub_categories: categories },
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
