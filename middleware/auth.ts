import { NextFunction, Request, Response } from "express";
import { adminApp } from "../firebase";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string | undefined = req
      .header("authorization")
      ?.split(" ")[1];
    // console.log("token", token);
    if (!token)
      return res.status(403).json({ msg: "please provide valid auth token " });
    adminApp
      .auth()
      .verifyIdToken(token)
      .then((claims) => {
        // console.log("clams", claims);
        req.body.user = claims; //{ ...req.body, ...claims };
        next();
      })
      .catch((err) => {
        console.log("token err", err);
        return res
          .status(401)
          .json({ msg: "please provide valid auth token " });
      });
  } catch (error) {
    console.log("token error", error);
    return res.status(500).json({ msg: "please provide valid auth token " });
  }
};
