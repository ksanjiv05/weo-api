import { Request, Response } from "express";
import { openai } from "../../../config/config";
import logging from "../../../config/logging";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { responseObj } from "../../../helper/response";
import { getQueryResponse } from "../../../helper/chatGptPoweredChatBot";
import sharp from "sharp";

export const getAiGeneratedLogo = async (req: Request, res: Response) => {
  try {
    const {
      title = "",
      description,
      titleInLogo = false,
      size = "1024x1024",
      n = 1,
    } = req.body;

    // const promptString = `
    // Create a logo for a brand called '${title}' that specializes in '${description}'. The design should feature a sleek, modern aesthetic with a glass effect. The logo should showcase in glass orb, similar to a terrarium. The glass should have a realistic, reflective surface. The overall design should be clean, elegant, and visually striking, with an emphasis on transparency and luminosity. Ensure the brand name is prominently displayed within or around the glass orb, integrating seamlessly with the design.
    // and also consider description.
    // 'logo should be single and center aligned.'
    // ${
    //   titleInLogo ? `The brand name should be included in the logo design.` : ""
    // }
    // `;

    const promptString = `
     Create a logo in a spherical glass effect over the entire image. 
     Include the brand name, ${title}, in a stylish, elegant font. 
     Ensure the brand name is prominently and harmoniously placed within the composition.
    Additionally, incorporate elements that reflect ${description} to enhance the overall design.

    `;

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

    const callTime = new Date().getTime();

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: promptString,
      n: n,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const img: any = response.data[0].b64_json;

    const respTime = new Date().getTime();
    console.log(
      "total time to take to genrate",
      (respTime - callTime) / 1000,
      "sec"
    );
    const buffer: Buffer = Buffer.from(img, "base64");
    console.log("buffer", buffer);
    const imageBuffer: any = await getImageBuffer(buffer);

    // res.set("Content-Type", "image/jpeg");
    // res.set("Content-Length", imageBuffer.length);
    // return res.send(imageBuffer);
    // const image_urls = response.data;
    const bs = imageBuffer.toString("base64"); //Buffer.from(imageBuffer).toString("base64")
    // console.log("bs", bs);
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "here your ai genrated images",
      error: null,
      data: bs,
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

const getImageBuffer = async (buffer: any) => {
  const imageBuffer = await sharp(buffer)
    .resize({ width: 512, height: 512, fit: "fill" })
    .toBuffer();
  // .jpeg({ quality: 20 })
  // .toFile("image.jpg");
  return imageBuffer;
};

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

    // const response = await openai.images.generate({
    //   model: "dall-e-3",
    //   prompt: promptString,
    //   n: n,
    //   size: "1024x1024",
    // });
    // // console.log("response", response);
    // const image_urls = response.data;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: promptString,
      n: n,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const img: any = response.data[0].b64_json;
    const buffer: Buffer = Buffer.from(img, "base64");
    const imageBuffer: any = await getImageBuffer(buffer);
    // const resx = await openai.images.createVariation({
    //   image: buffer,
    //   n: 1,
    //   size: "512x512",
    // });
    // console.log("response", resx);

    // res.set("Content-Type", "image/jpeg");
    // res.set("Content-Length", imageBuffer.length);
    // return res.send(imageBuffer);

    const bs = imageBuffer.toString("base64");
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "here your ai generated image",
      error: null,
      data: bs,
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

export const getAiGeneratedText = async (req: Request, res: Response) => {
  try {
    const { promptString = "" } = req.body;
    if (promptString == "")
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "Please provide promptString",
        error: null,
        data: null,
      });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "suggest me 5 brand and short description for vegitable category in json format",
            },
          ],
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "text",
      },
    });
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      msg: "here your answer",
      error: null,
      data: response.choices[0].message, //response.data.choices[0].text,
    });
  } catch (error: any) {
    logging.error("AI Bot", "unable to genrate text", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to genrate text",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};
