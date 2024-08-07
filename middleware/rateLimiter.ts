import { NextFunction, Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 20, // maximum number of requests allowed
  duration: 60, // time frame in seconds
});

const rateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      // request allowed,
      // proceed with handling the request
      next();
    })
    .catch(() => {
      // request limit exceeded,
      // respond with an appropriate error message
      res.status(429).send("Too Many Requests");
    });
};
export default rateLimiterMiddleware;
