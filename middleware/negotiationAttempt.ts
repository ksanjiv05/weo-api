import {} from "express";
import NegotiationAttempt from "../models/negotiationAttempt.model";
import { responseObj } from "../helper/response";
import { HTTP_STATUS_CODES } from "../config/statusCode";
import { negotiationConfig } from "../config/config";

export const negotiationAttempt = async (req: any, res: any, next: any) => {
  const { id, negotiation = true } = req.body;
  const { user } = req;
  const negotiationAttempt = await NegotiationAttempt.findOne({
    offer: id,
    user: user._id,
  });
  console.log("negotiationAttempt",negotiation, negotiationAttempt);
  if (!negotiation) {
    req.body.negotiationAttemptInstance = negotiationAttempt;
    next();
  } else {
    if (negotiationAttempt) {
      if (negotiationAttempt.noOfAttempts < negotiationConfig.maxAttempts) {
        negotiationAttempt.noOfAttempts += 1;
        await negotiationAttempt.save();
        req.body.negotiationAttemptInstance = negotiationAttempt;
        next();
      } else if (!negotiation) {
        next();
      } else {
        return responseObj({
          resObj: res,
          type: "error",
          statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
          msg: `You can not make more than ${negotiationConfig.maxAttempts} attempts`,
          error: null,
          data: null,
        });
      }
    } else {
      const newNegotiationAttempt = new NegotiationAttempt({
        offer: id,
        user: user._id,
        noOfAttempts: 1,
      });

      await newNegotiationAttempt.save();
      req.body.negotiationAttemptInstance = newNegotiationAttempt;
      next();
    }
  }
};
