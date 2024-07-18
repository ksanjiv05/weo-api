import { Response } from "express";
import { responseObj } from "../../../helper/response";
import { IRequest } from "../../../interfaces/IRequest";
import { addBankAccount } from "../../../payment/razorpay/account";

export const newBankAccount = async (req: IRequest, res: Response) => {
  try {
    const { user } = req;
    const {
      accountNumber,
      ifsc,
      business_name = "default",
      accountType = "savings",
    } = req.body;
    if (!accountNumber || !ifsc) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: 400,
        msg: "account number and ifsc are required",
        error: null,
        data: null,
      });
    }
    const account = await addBankAccount({
      ifsc_code: ifsc,
      uid: user._id,
      email: user.email,
      business_name: business_name === "default" ? user.name : business_name,
      beneficiary_name: user.name,
      account_type: accountType,
      account_number: accountNumber,
      name: user.name,
    });

    if (!account.status) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: 500,
        msg: "Unable to create account",
        error: account.data,
        data: null,
      });
    }

    const { id = "" } = account.data;

    user.accounts = [
      ...user.accounts,
      {
        accountId: id,
        isPrimary: false,
        accountHolderName: user.name,
      },
    ];
    await user.save();

    return responseObj({
      resObj: res,
      type: "success",
      statusCode: 200,
      msg: "account created successfully",
      error: null,
      data: account,
    });
  } catch (error: any) {
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: 500,
      msg: "Unable to create account",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};

export const changePrimaryBankAccount = async (
  req: IRequest,
  res: Response
) => {
  try {
    const { user } = req;
    const { accountId } = req.body;
    if (!accountId) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: 400,
        msg: "account id is required",
        error: null,
        data: null,
      });
    }
    const { accounts } = user;
    const index = accounts.findIndex(
      (account: any) => account.accountId === accountId
    );
    if (index === -1) {
      return responseObj({
        resObj: res,
        type: "error",
        statusCode: 404,
        msg: "account not found",
        error: null,
        data: null,
      });
    }
    const newAccounts = accounts.map((account: any) => {
      if (account.accountId === accountId) {
        account.isPrimary = true;
      } else {
        account.isPrimary = false;
      }
      return account;
    });
    user.accounts = newAccounts;
    await user.save();
    return responseObj({
      resObj: res,
      type: "success",
      statusCode: 200,
      msg: "account changed successfully",
      error: null,
      data: null,
    });
  } catch (error: any) {
    return responseObj({
      resObj: res,
      type: "error",
      statusCode: 500,
      msg: "Unable to change account",
      error: error.message ? error.message : error,
      data: null,
    });
  }
};

// export const newWalletAddress = async (req: IRequest, res: Response) => {
//   try {
//     const { user } = req;
//     const {  } = req.body;
//     if (!address) {
//       return responseObj({
//         resObj: res,
//         type: "error",
//         statusCode: 400,
//         msg: "address is required",
//         error: null,
//         data: null,
//       });
//     }
//     user.walletAddress = address;
//     await user.save();
//     return responseObj({
//       resObj: res,
//       type: "success",
//       statusCode: 200,
//       msg: "wallet address added successfully",
//       error: null,
//       data: null,
//     });
//   } catch (error: any) {
//     return responseObj({
//       resObj: res,
//       type: "error",
//       statusCode: 500,
//       msg: "Unable to add wallet address",
//       error: error.message ? error.message : error,
//       data: null,
//     });
//   }
// }
