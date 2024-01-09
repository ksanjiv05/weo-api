// instance.payments.transfer(paymentId,{
//     "transfers": [
//      {
//        "account": 'acc_HgzcrXeSLfNP9U',
//        "amount": 100,
//        "currency": "INR",
//        "notes": {
//          "name": "Gaurav Kumar",
//          "roll_no": "IEC2011025"
//        },
//        "linked_account_notes": [
//          "branch"
//        ],
//        "on_hold": 1,
//        "on_hold_until": 1671222870
//      }
//    ]
//   })

import instance from "..";
import {
  TransferFromAccount,
  TransferFromAmount,
  TransferFromPayment,
} from "../../../types";

export const transfer = async ({
  paymentId,
  account,
  amount,
  currency = "INR",
  name = "",
}: TransferFromPayment) => {
  try {
    const response = await instance.payments.transfer(paymentId, {
      transfers: [
        {
          account,
          amount,
          currency,
          notes: {
            name,
          },
          linked_account_notes: ["branch"],
          //   on_hold: 1,
          //   on_hold_until: 1671222870,
        },
      ],
    });
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

// instance.orders.create({
//     "amount": 2000,
//     "currency": "INR",
//     "transfers": [
//       {
//         "account": "acc_CPRsN1LkFccllA",
//         "amount": 1000,
//         "currency": "INR",
//         "notes": {
//           "branch": "Acme Corp Bangalore North",
//           "name": "Gaurav Kumar"
//         },
//         "linked_account_notes": [
//           "branch"
//         ],
//         "on_hold": 1,
//         "on_hold_until": 1671222870
//       },
//       {
//         "account": "acc_CNo3jSI8OkFJJJ",
//         "amount": 1000,
//         "currency": "INR",
//         "notes": {
//           "branch": "Acme Corp Bangalore South",
//           "name": "Saurav Kumar"
//         },
//         "linked_account_notes": [
//           "branch"
//         ],
//         "on_hold": 0
//       }
//     ]
//   })

export const transferFromOrder = async ({
  amount,
  currency,
  account,
  amounToTransfer,
  name = "",
}: TransferFromAmount) => {
  try {
    const response = await instance.orders.create({
      amount,
      currency,
      transfers: [
        {
          account,
          amount: amounToTransfer,
          currency,
          notes: {
            // branch: "Acme Corp Bangalore North",
            name,
          },
          linked_account_notes: ["branch"],
          on_hold: 0,
        },
      ],
    });
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

// instance.transfers.create({
//     "account": accountId,
//     "amount": 500,
//     "currency": "INR"
//   })

export const createDirectTransfer = async ({
  account,
  amount,
  currency = "INR",
}: TransferFromAccount) => {
  try {
    const response = await instance.transfers.create({
      account,
      amount,
      currency,
    });
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

// instance.transfers.fetch(transferId)

export const fetchTransfer = async (transferId: string) => {
  try {
    const response = await instance.transfers.fetch(transferId);
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

//instance.transfers.fetchSettlements()

export const fetchSettlements = async () => {
  try {
    const response = await instance.transfers.fetchSettlements();
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

// var instance = new Razorpay({
//     key_id: key,
//     key_secret: secret,
//     headers: {"X-Razorpay-Account": "acc_IRQWUleX4BqvYn"}
//   });

// instance.payments.all()

//https://github.com/razorpay/razorpay-node/blob/master/documents/transfer.md#reverse-transfers-from-all-linked-accounts
