import { NextFunction, Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { IRequest } from "../interfaces/IRequest";

const rateLimiter = new RateLimiterMemory({
  points: 3, // maximum number of requests allowed
  duration: 60 * 60 * 24, // time frame in seconds
});

const aiImgRateLimiterMiddleware = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  rateLimiter
    .consume(req.user._id)
    .then(() => {
      // request allowed,
      // proceed with handling the request
      next();
    })
    .catch(() => {
      // request limit exceeded,
      // respond with an appropriate error message
      res.status(429).send("Max requests allowed per day reached");
    });
};
export default aiImgRateLimiterMiddleware;
