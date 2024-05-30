import { NextFunction, Request, Response } from "express";
import { adminApp } from "../firebase";
import User from "../models/user.model";

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
      .then(async (claims) => {
        // console.log("clams", claims);
        const user = await User.findOne({ uid: claims.uid });
        req.body.user = user; //{ ...req.body, ...claims };
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
