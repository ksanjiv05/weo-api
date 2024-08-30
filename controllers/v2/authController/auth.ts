import { Request, Response } from "express";
import logging from "../../../config/logging";
import User, { IUser } from "../../../models/user.model";
import { responseObj } from "../../../helper/response";
import { HTTP_STATUS_CODES } from "../../../config/statusCode";
import { validationResult } from "express-validator";
import { adminApp } from "../../../firebase";
import { ERROR_CODES } from "../../../config/errorCode";
import { IRequest } from "../../../interfaces/IRequest";
import { addWallet } from "../../../helper/user";
import { IWallet } from "../../../models/wallet.model";
import mongoose from "mongoose";
import { OFFER_STATUS, STATUS } from "../../../config/enums";
import { BRAND_STATUS } from "../../../interfaces/IBrand";

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "fields are required",
        error: errors.array({}),
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }
    console.log("---req.body---", req.body);
    const newUser = new User(req.body);
    await newUser.save();

    const walletObj: IWallet | any = {
      user: newUser._id,
      name: newUser.name,
      balance: 0,
      currency: req.body.currency,
    };
    addWallet(walletObj);

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: HTTP_STATUS_CODES.CREATED,
      msg: "successfully registered",
      error: null,
      data: newUser,
      code: ERROR_CODES.SUCCESS,
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
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const isExistingUser = async (req: Request, response: Response) => {
  try {
    const { phone = "" } = req.query;

    if (phone == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid phone",
        error: null,
        resObj: response,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    const user = await User.findOne({ phone });

    console.log("user check", phone, user);
    if (!user) {
      return responseObj({
        statusCode: HTTP_STATUS_CODES.ACCEPTED,
        type: "error",
        msg: "user not found",
        error: null,
        resObj: response,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "user already exists",
      error: null,
      resObj: response,
      data: null,
      code: ERROR_CODES.DUPLICATE,
    });
  } catch (error: any) {
    logging.error("Is Existing User", "unable to find user", error);
    return responseObj({
      resObj: response,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to find user",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};

export const isUserNameAvailable = async (req: Request, res: Response) => {
  try {
    const { creatorName = "" } = req.params;
    if (creatorName == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid creator name",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });

    const user = await User.findOne({ creatorName });

    if (!user)
      return responseObj({
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        type: "success",
        msg: "creator name is available",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.SUCCESS,
      });
    return responseObj({
      statusCode: HTTP_STATUS_CODES.ACCEPTED,
      type: "error",
      msg: "creator name is not available",
      error: null,
      resObj: res,
      data: null,
      code: ERROR_CODES.DUPLICATE,
    });
  } catch (error: any) {
    logging.error("Is User Name Available", "unable to find user", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to find user",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const updateCreator = async (req: IRequest, res: Response) => {
  try {
    const { creatorName = "", description = "", profileImage = "" } = req.body;
    const { uid = "" } = req.user;
    if (
      uid == "" ||
      creatorName == "" ||
      description == "" ||
      profileImage == ""
    )
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid  user ID and creator name, description and profile image",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   return res.status(400).json({
    //     success: false,
    //     errors: errors.array({}),
    //   });
    // }

    const user = await User.findOne({ uid });
    console.log("uid", uid, creatorName, user);
    if (!user) {
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "user not found",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.NOT_FOUND,
      });
    }
    const isUserNameAvailable = await User.findOne({
      creatorName: req.body.creatorName,
    });
    if (!isUserNameAvailable) {
      user.creatorName = creatorName;
      user.description = description === "" ? user.description : description;
      user.profileImage =
        profileImage === "" ? user.profileImage : profileImage;
      await user.save();
    } else {
      return responseObj({
        statusCode: HTTP_STATUS_CODES.ACCEPTED,
        type: "error",
        msg: "duplicate user name",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.DUPLICATE,
      });
    }

    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your profile has been updated",
      error: null,
      resObj: res,
      data: null,
      code: ERROR_CODES.SUCCESS,
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
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const updateUser = async (req: IRequest, res: Response) => {
  try {
    const { _id = "" } = req.body;
    const { uid = "" } = req.user;
    if (_id == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid mongo user ID",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        msg: "fields are required",
        error: errors.array({}),
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    }

    if (req.body.creatorName != "") {
      const user = await User.findOne({ uid });
      if (!user) {
        return responseObj({
          statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
          type: "error",
          msg: "user not found",
          error: null,
          resObj: res,
          data: null,
          code: ERROR_CODES.NOT_FOUND,
        });
      }
      if (user.creatorName !== req.body.creatorName) {
        const isUserNameAvailable = await User.findOne({
          creatorName: req.body.creatorName,
        });
        if (isUserNameAvailable) {
          return responseObj({
            statusCode: HTTP_STATUS_CODES.ACCEPTED,
            type: "error",
            msg: "creator name is not available",
            error: null,
            resObj: res,
            data: null,
            code: ERROR_CODES.DUPLICATE,
          });
        }
      }

      //creatorName: req.body.creatorName
    }
    await adminApp.auth().updateUser(uid, {
      email: req.body.email,
      phoneNumber: req.body.phone,
      displayName: req.body.name,
    });

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
      code: ERROR_CODES.SUCCESS,
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
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const getUserProfile = async (req: IRequest, res: Response) => {
  try {
    // const { uid = "" } = req.body;
    const { uid = "" } = req.user;
    const { initData = false } = req.query;
    if (uid == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid user firebase ID",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    let user = null;

    console.log("initData", initData);
    if (initData == "true") {
      user = await User.findOne({ uid })
        .select("creatorName")
        .select("currency");
      User.updateOne({ uid }, { $set: { lastActive: new Date() } });
      return responseObj({
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        type: "success",
        msg: "your profile",
        error: null,
        resObj: res,
        data: user,
        code: ERROR_CODES.SUCCESS,
      });
    } else {
      user = await User.aggregate([
        {
          $match: {
            uid,
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "_id",
            foreignField: "user",
            as: "brands",
            pipeline: [
              {
                $match: {
                  status: { $eq: STATUS.LIVE },
                },
              },
            ],
          },
        },
        {
          $project: {
            device: 0,
            bankAccounts: 0,
          },
        },
      ]);
      return responseObj({
        statusCode: HTTP_STATUS_CODES.SUCCESS,
        type: "success",
        msg: "your profile",
        error: null,
        resObj: res,
        data: user.length > 0 ? user[0] : null,
        code: ERROR_CODES.SUCCESS,
      });
    }
  } catch (error: any) {
    logging.error("Get User", "unable to get user profile", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get user profile",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
    });
  }
};

export const getUserPublicProfile = async (req: IRequest, res: Response) => {
  try {
    // const { uid = "" } = req.body;
    const { id = "" } = req.params;
    if (id == "")
      return responseObj({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        type: "error",
        msg: "please provide a valid user ID",
        error: null,
        resObj: res,
        data: null,
        code: ERROR_CODES.FIELD_VALIDATION_REQUIRED_ERR,
      });
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "user",
          as: "brands",
          pipeline: [
            {
              $match: {
                status: { $nq: BRAND_STATUS.DRAFT },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "_id",
          foreignField: "user",
          as: "offers",
          pipeline: [
            {
              $match: {
                status: { $nq: OFFER_STATUS.PENDING },
              },
            },
          ],
        },
      },
      {
        $project: {
          device: 0,
          bankAccounts: 0,
        },
      },
    ]);

    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "your public profile",
      error: null,
      resObj: res,
      data: user.length > 0 ? user[0] : null,
      code: ERROR_CODES.SUCCESS,
    });
  } catch (error: any) {
    logging.error("Get Public User", "unable to get user profile", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get user profile",
      error: error.message ? error.message : "internal server error",
      data: null,
      code: ERROR_CODES.SERVER_ERR,
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

export const getUsers = async (req: IRequest, res: Response) => {
  try {
    const { admin = false } = req.user;
    if (!admin) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
        msg: "you are not allowed to get users",
        error: "you are not allowed to get users",
        data: null,
        code: ERROR_CODES.AUTH_ERR,
      });
    }
    const users = await User.find();
    return responseObj({
      statusCode: HTTP_STATUS_CODES.SUCCESS,
      type: "success",
      msg: "all users",
      error: null,
      resObj: res,
      data: users,
    });
  } catch (error: any) {
    logging.error("Get Users", "unable to get all users", error);
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      msg: "unable to get all users",
      error: error.message ? error.message : "internal server error",
      data: null,
    });
  }
};
