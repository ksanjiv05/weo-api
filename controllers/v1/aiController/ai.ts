import { Request, Response } from "express";
import { openai } from "../../../config/config";
import logging from "../../../config/logging";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { responseObj } from "../../../helper/response";
import { getQueryResponse } from "../../../helper/chatGptPoweredChatBot";

export const getAiGeneratedImg = async (req: Request, res: Response) => {
  try {
    const { promptString = "", size = "1024x1024", n = 1 } = req.body;

    if (promptString == "")
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Please provide promptString",
        error: null,
        data: null,
      });

    // const response = await openai.createImage({
    //   prompt: promptString,
    //   n,
    //   size,
    // });
    // https://community.openai.com/t/429-rate-limit-exceeded-limit-0-1min-current-1-1min/565451

    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: promptString,
      n: 2,
      size: "512x512",
    });
    console.log("response", response);
    const image_urls = response.data;
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "here your ai genrated images",
      error: null,
      data: image_urls,
    });
  } catch (error: any) {
    logging.error("AI Bot", "unable to genrate images", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to genrate images",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const getAiGeneratedChatResponse = async (
  req: Request,
  res: Response
) => {
  try {
    const { queryString = "" } = req.body;

    if (queryString == "")
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Please provide query",
        error: null,
        data: null,
      });

    const response = await getQueryResponse(queryString);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "here your answer",
      error: null,
      data: response,
    });
  } catch (error: any) {
    logging.error("AI Chat", "unable tos connect chat bot", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to add connect chat bot",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};
