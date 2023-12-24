import { Document } from "mongoose";

export interface IOTransactionLog extends Document {
  uid: string;
  offerId: string;
  creatorId: string;

  orderId: string | null;
  atONetworkPrice: string;
  atOUserkPrice: string;

  transactionStatus: string;
  transactionAmount: number;
  transactionCurrency: string;
  transactionDate: number;
  transactionTime: number;
}
