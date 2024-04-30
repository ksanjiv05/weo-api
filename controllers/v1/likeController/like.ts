import { Request, Response } from "express";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import logging from "../../../config/logging";
import User from "../../../models_v1/User";

export const addLike = async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);
    const { oid, uid = "" } = req.body;
    if (!oid || !uid) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "offer id is missing",
        error: "offer id is missing",
        data: null,
      });
    }
    // const errors = validationResult(req);
    // // if there is error then return Error
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({
    //     success: false,
    //     errors: errors.array({}),
    //   });
    // }

    await User.updateOne(
      {
        uid,
      },
      {
        $addToSet: {
          likes: oid,
        },
      }
    );

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "you are successfully added Wishlist",
      error: null,
      data: null,
    });
  } catch (error: any) {
    logging.error("Wishlist", "unable to add Wishlist", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add Wishlist",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};
