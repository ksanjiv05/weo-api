import logging from "../../config/logging";
import { ICategory } from "../../interfaces/ICategory";
import Category from "../../models/Category";
import { Request, Response } from "express";
import { responseObj } from "../response";
import { HTTP_STATUS_CODES } from "../../config/statusCode";
import { ERROR_CODES } from "../../config/errorCode";

export const pupulateOrUpdateCategory = async (category: ICategory) => {
  const categories = category.categories;
  delete category.categories;
  try {
    await Category.updateOne(
      { categoryTitle: category.categoryTitle },
      {
        ...category,
        $addToSet: {
          categories: { $each: categories },
        },
      },
      {
        upsert: true,
      }
    );
    return true;
  } catch (err) {
    logging.error("Update Or Pupolute Category ", "Mongo", err);
    return false;
  }
};

export const getCategory = async (categoryTitle: string) => {};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { page = 0, perPage = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);
    const filter = {
      ...(status === "" ? {} : { status }),
      // ...(categoriesIds.length === 0
      //   ? {}
      //   : { categoriesIds: { $in: categoriesIds } }),
    };
    const categories = await Category.find({})
      .sort("-createdAt")
      .skip(Number(skip))
      .limit(Number(perPage));
    const total = await Category.find(filter).count();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully get categories",
      error: null,
      code: ERROR_CODES.SUCCESS,
      data: { categories, total },
    });
  } catch (error: any) {
    logging.error("Category", "unable to get Categories", error);
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
