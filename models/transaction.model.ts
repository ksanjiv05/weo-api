// Objective : Define the transaction model
// Author : Sanjiv Kumar Pandit

import mongoose, { Schema, Document } from "mongoose";
import logging from "../config/logging";
import { conn_v2 } from "../db";

//note
//orderid for collected

export interface ITransaction extends Document {
  user: string;
  transactionId: string;
  orderId: string | null;
  paymentId: string | null;
  transferId: string | null;
  transactionType: string; //collected,withdrawal,transfer
  transactionMethod: {
    type: string;
    id: string;
  };
  transactionAmount: number;
  currency: string;

  transactionStatus: string;
  refundStatus: string | null;
  refundAmount: number;
  transactionDate: Date;
  transactionDescription: string;
  transactionFrom: string; // user id of debit user
  transactionTo: string; // user id of credit user

  outlet: string;
  offer: string;
  brand: string;
  serviceTools: string;
  acquirerData: any;
  fee: number;
  tax: number;
  email: string;
  contact: string;
  earn: string; // offer sold or resold
  spend: string; // offer collected, listed, advertised, service tool,
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
  bank: any;
  wallet: any;
  rewards: number; //o value
}

const transactionSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    transactionId: { type: String },
    orderId: { type: String },
    paymentId: { type: String },
    transferId: { type: String, required: false },
    transactionType: { type: String },
    transactionMethod: {
      type: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: false,
      },
    },
    transactionAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    transactionStatus: { type: String, required: true },
    transactionDate: { type: Date, required: true },
    transactionDescription: { type: String },
    transactionFrom: { type: String, required: true },
    transactionTo: { type: String, required: true },

    outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet" },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    serviceTools: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceTool" },

    refundStatus: { type: String, required: false },
    refundAmount: { type: Number, required: false },

    acquirerData: { type: Object, required: false },
    earn: { type: String, required: false },
    spend: { type: String, required: false },
    fee: { type: Number, required: false },
    tax: { type: Number, required: false },
    rewards: { type: Number, required: false },

    email: { type: String, required: false },
    contact: { type: String, required: false },

    error: { type: Object, required: false },

    bank: { type: Object, required: false },
    wallet: { type: Object, required: false },
  },
  { timestamps: true }
);

transactionSchema.index({ transactionId: 1 }, { unique: true });

export default conn_v2.model<ITransaction>("Transaction", transactionSchema);
