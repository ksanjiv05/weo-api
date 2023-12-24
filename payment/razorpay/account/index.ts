// instance.virtualAccounts.create({
//     "receivers": {
//       "types": [
//         "bank_account"
//       ]
//     },
//     "allowed_payers": [
//       {
//         "type": "bank_account",
//         "bank_account": {
//           "ifsc": "RATN0VAAPIS",
//           "account_number": 2223330027558515
//         }
//       }
//     ],
//     "description": "Virtual Account created for Raftar Soft",
//     "customer_id": "cust_HssUOFiOd2b1TJ",
//     "notes": {
//       "project_name": "Banking Software"
//     }
//   })

import axios from "axios";
import instance from "..";
// ifsc: string,
//   account_number: string,
//   description: string,
//   uid: string,
//   bank_name: string,
interface IVirtualAccount {
  ifsc: string;
  account_number: string;
  description: string;
  uid: string;
  bank_name: string;
}

export const createVirtualAccount = async ({
  ifsc,
  account_number,
  description,
  uid,
  bank_name,
}: IVirtualAccount) => {
  try {
    const response = await instance.virtualAccounts.create({
      receivers: {
        types: ["bank_account"],
      },
      allowed_payers: [
        {
          type: "bank_account",
          bank_account: {
            ifsc,
            account_number,
          },
        },
      ],
      description,
      customer_id: uid,
      notes: {
        bank_name,
      },
    });
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

//https://github.com/razorpay/razorpay-node/blob/master/documents/virtualAccount.md#create-staticdynamic-qr

//instance.virtualAccounts.fetch(virtualId)

export const fetchVirtualAccount = async (virtualId: string) => {
  try {
    const response = await instance.virtualAccounts.fetch(virtualId);
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

//instance.virtualAccounts.all(options)
// from	timestamp	timestamp after which the payments were created
// to	timestamp	timestamp before which the payments were created
// count	integer	number of virtual accounts to fetch (default: 10)
// skip	integer	number of virtual accounts to be skipped (default: 0)
export const fetchAllVirtualAccounts = async () => {
  try {
    const response = await instance.virtualAccounts.all();
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

//instance.virtualAccounts.fetchPayments(virtualId,options)

export const fetchVirtualAccountPayments = async (virtualId: string) => {
  try {
    const response = await instance.virtualAccounts.fetchPayments(virtualId);
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

//instance.virtualAccounts.close(virtualId)

export const closeVirtualAccount = async (virtualId: string) => {
  try {
    const response = await instance.virtualAccounts.close(virtualId);
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

//https://github.com/razorpay/razorpay-node/blob/master/documents/upi.md#create-a-recurring-payment

//https://razorpay.com/docs/api/payments/route/account-apis-beta/
interface IAddBankAccount {
  name: string;
  email: string;
  business_name: string;
  ifsc_code: string;
  beneficiary_name: string;
  account_type: string;
  account_number: string;
  uid: string;
  isUpdate?: boolean;
}

export const addBankAccount = async ({
  name,
  email,
  business_name,
  ifsc_code,
  beneficiary_name,
  account_type,
  account_number,
  uid,
  isUpdate,
}: IAddBankAccount) => {
  try {
    const config = {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    };
    const res = await axios.post(
      "https://api.razorpay.com/v1/beta/accounts",
      {
        name,
        email,
        tnc_accepted: true,
        account_details: {
          business_name,
          business_type: "individual",
        },
        bank_account: {
          ifsc_code,
          beneficiary_name,
          account_type,
          account_number,
        },
      },
      {
        headers: {
          Authorization: "Basic " + process.env.RAZ_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    return { status: true, data: res.data };
  } catch (error: any) {
    console.log(error.response.data);
    return { status: false, data: null };
  }
};

//https://github.com/razorpay/razorpay-node/blob/master/documents/plans.md
