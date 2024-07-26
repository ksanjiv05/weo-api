import axios from "axios";
import instance from "..";
import {
  TransferFromAccount,
  TransferFromAmount,
  TransferFromPayment,
} from "../../../types";

// export const transfer = async ({
//   paymentId,
//   account,
//   amount,
//   currency = "INR",
//   name = "",
// }: TransferFromPayment) => {
//   try {
//     const response = await instance.payments.transfer(paymentId, {
//       transfers: [
//         {
//           account,
//           amount,
//           currency,
//           notes: {
//             name,
//           },
//           linked_account_notes: ["branch"],
//           //   on_hold: 1,
//           //   on_hold_until: 1671222870,
//         },
//       ],
//     });
//     return response;
//   } catch (error: any) {
//     console.log(error);
//     return null;
//   }
// };

// export const transferFromOrder = async ({
//   amount,
//   currency,
//   account,
//   amounToTransfer,
//   name = "",
// }: TransferFromAmount) => {
//   try {
//     const response = await instance.orders.create({
//       amount,
//       currency,
//       transfers: [
//         {
//           account,
//           amount: amounToTransfer,
//           currency,
//           notes: {
//             // branch: "Acme Corp Bangalore North",
//             name,
//           },
//           linked_account_notes: ["branch"],
//           on_hold: 0,
//         },
//       ],
//     });
//     return response;
//   } catch (error: any) {
//     console.log(error);
//     return null;
//   }
// };

// export const createDirectTransfer = async ({
//   account,
//   amount,
//   currency = "INR",
// }: TransferFromAccount) => {
//   try {
//     const response = await instance.transfers.create({
//       account,
//       amount,
//       currency,
//     });
//     return response;
//   } catch (error: any) {
//     console.log(error);
//     return null;
//   }
// };

// // instance.transfers.fetch(transferId)

// export const fetchTransfer = async (transferId: string) => {
//   try {
//     const response = await instance.transfers.fetch(transferId);
//     return response;
//   } catch (error: any) {
//     console.log(error);
//     return null;
//   }
// };

// //instance.transfers.fetchSettlements()

// export const fetchSettlements = async () => {
//   try {
//     const response = await instance.transfers.fetchSettlements();
//     return response;
//   } catch (error: any) {
//     console.log(error);
//     return null;
//   }
// };

export const fundTransfer = async ({
  user,
  account,
  amount,
  currency = "INR",
  name = "",
  purpose = "withdraw",
}: TransferFromPayment) => {
  try {
    const res = await axios.post(
      "https://api.razorpay.com/v1/contacts",
      {
        account_number: "2323230036824705",
        fund_account_id: account,
        amount: amount,
        currency,
        mode: "IMPS",
        purpose,
        queue_if_low_balance: true,
        reference_id: "",
        narration: "WEO Fund Transfer",
        notes: {
          user,
          name,
        },
      },
      {
        headers: {
          Authorization: "Basic " + process.env.RAZ_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("constact data", res.data);

    return res.data;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};
