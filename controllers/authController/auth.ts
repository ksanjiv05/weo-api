import { Request, Response } from "express";
import logging from "../../config/logging";
import User from "../../models/User";
import { IUser } from "../../interfaces/IUser";
import { responseObj } from "../../helper/response";
import { HTTP_STATUS_CODES } from "../../config/statusCode";
import { validationResult } from "express-validator";
import { adminApp } from "../../firebase";

export const register = async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array({}),
      });
    }
    const newUser = new User(req.body);
    await newUser.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "successfully registered",
      error: null,
      data: newUser,
    });
  } catch (error: any) {
    logging.error("Register", "unable to register user", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to register user",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const isExistingUser = async (req: Request, res: Response) => {
  try {
    const { phone = "" } = req.query;
    if (phone == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid phone",
        error: null,
        resObj: res,
        data: null,
      });
    const user = await User.findOne({ phone });
    if (!user)
      return responseObj({
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
        type: "error",
        msg: "user not found",
        error: null,
        resObj: res,
        data: null,
      });
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "user already exists",
      error: null,
      resObj: res,
      data: null,
    });
  } catch (error: any) {
    logging.error("Is Existing User", "unable to find user", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to find user",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { _id = "" } = req.body;
    if (_id == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid mongo user ID",
        error: null,
        resObj: res,
        data: null,
      });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array({}),
      });
    }

    await User.updateOne(
      { _id },
      {
        ...req.body,
      }
    );
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your profile has been updated",
      error: null,
      resObj: res,
      data: null,
    });
  } catch (error: any) {
    logging.error("Update User", "unable to update user profile", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to update user profile",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { uid = "" } = req.body;
    if (uid == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid user ID",
        error: null,
        resObj: res,
        data: null,
      });
    const user = await User.findOne({ uid });
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your profile",
      error: null,
      resObj: res,
      data: user,
    });
  } catch (error: any) {
    logging.error("Get User", "unable to get user profile", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get user profile",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const deleteUserProfile = async (req: Request, res: Response) => {
  return res.status(201).send("Not implemented");
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email = "", password = "" } = req.body;
    if (email == "" || password == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid email and password",
        error: null,
        resObj: res,
        data: null,
      });
    const user = await User.findOne({ email });

    // adminApp.auth().generateSignInWithEmailLink(email);
    // if (!user)
    //   return responseObj({
    //     statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    //     type: "error",
    //     msg: "user not found",
    //     error: null,
    //     resObj: res,
    //     data: null,
    //   });

    // return responseObj({
    //   statusCode: HTTP_STATUS_CODES.SUCCESS,
    //   type: "success",
    //   msg: "successfully logged in",
    //   error: null,
    //   resObj: res,
    //   data: token,
    // });
  } catch (error: any) {
    logging.error("Login", "unable to login user", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to login user",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};
