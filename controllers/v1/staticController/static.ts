import { Request, Response } from "express";
import logging from "../../../config/logging";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";

export const uploadStaticFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "hey, you are successfully uploaded the file",
      error: null,
      resObj: res,
      data: { filename: file?.filename },
    });
  } catch (error: any) {
    logging.error("Add Static File", "unable to add static file", error);

    return responseObj({
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      type: "error",
      msg: error?.message || "unable to process your request",
      error: null,
      resObj: res,
      data: null,
    });
  }
};

export const uploadStaticFiles = async (req: Request, res: Response) => {
  try {
    const files:
      | Express.Multer.File[]
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined = req.files;
    // console.log("files", files);
    // const fileList = files && files.map((v: { filename: any }) => v.filename);
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "hey, you are successfully uploaded the file",
      error: null,
      resObj: res,
      data: { files },
    });
  } catch (error: any) {
    logging.error("Add Static File", "unable to add static file", error);

    return responseObj({
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      type: "error",
      msg: error?.message || "unable to process your request",
      error: null,
      resObj: res,
      data: null,
    });
  }
};
