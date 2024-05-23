// Objective : Define the transaction model
// Author : Sanjiv Kumar Pandit

import mongoose, { Schema, Document } from "mongoose";
import logging from "../config/logging";
import { conn_v2 } from "../db";

//note
//orderid for collected

export interface ITransaction extends Document {
  transactionId: string;
  orderId: string | null;
  paymentId: string | null;
  transferId: string | null;
  transactionType: string; //collected,withdrawal,transfer
  transactionMethod: {
    method: string; // bank, wallet, card, upi
    methodId: string;
  };
  transactionAmount: number;
  currency: string;
  transactionStatus: {
    status: string; // success, failed, pending
    message: string; // if failed
  };
  transactionDate: Date;
  transactionDescription: string;
  transactionFrom: string; // user id of debit user
  transactionTo: string; // user id of credit user

  outlet: string;
  offer: string;
  brand: string;
  serviceTools: string;

  earn: string; // offer sold or resold
  spend: string; // offer collected, listed, advertised, service tool,

  rewards: number; //o value
}

const transactionSchema = new Schema(
  {
    transactionId: { type: String, required: true },
    orderId: { type: String, required: false },
    paymentId: { type: String, required: false },
    transferId: { type: String, required: false },
    transactionType: { type: String, required: true },
    transactionMethod: {
      method: { type: String, required: true },
      methodId: { type: String, required: true },
    },
    transactionAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    transactionStatus: {
      status: { type: String, required: true },
      message: { type: String, required: false },
    },
    transactionDate: { type: Date, required: true },
    transactionDescription: { type: String, required: true },
    transactionFrom: { type: String, required: true },
    transactionTo: { type: String, required: true },

    outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet" },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    serviceTools: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceTool" },

    earn: { type: String, required: false },
    spend: { type: String, required: false },

    rewards: { type: Number, required: false },
  },
  { timestamps: true }
);
