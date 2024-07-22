import axios from "axios";
import instance from "..";
import { BankAccount, ContactProps } from "../../../types";

/**
 * Adds a bank account to the Razorpay account.
 *
 * @param {BankAccount} bankAccount - The bank account details.
 * @param {string} bankAccount.name - The name of the account holder.
 * @param {string} bankAccount.email - The email associated with the account.
 * @param {string} bankAccount.business_name - The name of the business.
 * @param {string} bankAccount.ifsc_code - The IFSC code of the bank.
 * @param {string} bankAccount.beneficiary_name - The name of the beneficiary.
 * @param {string} bankAccount.account_type - The type of the account.
 * @param {string} bankAccount.account_number - The account number.
 * @param {string} bankAccount.uid - The unique identifier of the account.
 * @param {boolean} bankAccount.isUpdate - Flag indicating if the account is being updated.
 * @return {Promise<{ status: boolean, data: any }>} - A promise that resolves to an object with the status and data of the request.
 * @throws {Error} - If there is an error during the request.
 */
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
}: BankAccount) => {
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

export const addFundAccount = async ({
  name,
  email,
  contact,
  business_name,
  ifsc_code,
  beneficiary_name,
  account_type = "vendor",
  account_number,
  uid,
  isUpdate,
}: BankAccount) => {
  try {
    const contactRes = await addContact({
      name,
      email,
      contact,
      type: account_type,
      reference_id: uid,
      notes: {
        name: business_name,
        user: uid,
      },
    });
    if (contactRes) {
      const res = await axios.post(
        "https://api.razorpay.com/v1/fund_accounts",
        {
          contact_id: contactRes.id,
          account_type: "bank_account",
          bank_account: {
            name: beneficiary_name,
            ifsc: ifsc_code,
            account_number: account_number,
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
    } else return { status: false, data: null };
  } catch (error: any) {
    console.log(error.response.data);
    return { status: false, data: null };
  }
};

export const addContact = async ({
  name,
  email,
  contact,
  type,
  reference_id,
  notes,
}: ContactProps) => {
  try {
    const config = {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    };
    const res = await axios.post(
      "https://api.razorpay.com/v1/contacts",
      {
        name,
        email,
        contact,
        type,
        reference_id,
        notes,
      },
      {
        headers: {
          Authorization: "Basic " + process.env.RAZ_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
};

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

//https://github.com/razorpay/razorpay-node/blob/master/documents/plans.md
