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
  transactionAmount: number;
  currency: string;
  
  transactionStatus: string;
  transactionDate: Date;
  outlet: string;
  offer: string;
  brand: string;
  serviceTools: string;
  
  paymentGateway: { type: String; required: false };
  transactionObject: { type: Object; required: false };
  rewards: number; //o value

  // accountId: string;
  // paymentId: string | null;
  // transferId: string | null;
  // transactionType: string; //collected,withdrawal,transfer
  // transactionMethod: {
  //   type: string;
  //   id: string;
  // };
  // refundStatus: string | null;
  // refundAmount: number;
  // transactionDescription: string;
  // transactionFrom: string; // user id of debit user
  // transactionTo: string; // user id of credit user

  // acquirerData: any;
  // fee: number;
  // tax: number;
  // email: string;
  // contact: string;
  // earn: string; // offer sold or resold
  // spend: string; // offer collected, listed, advertised, service tool,
  // error: {
  //   code: string;
  //   description: string;
  //   source: string;
  //   step: string;
  //   reason: string;
  // };
  // bank: any;
  // wallet: any;
}

const transactionSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    transactionId: { type: String },
    paymentGateway: { type: String, required: false },
    transactionObject: { type: Object, required: false },

    outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet" },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    serviceTools: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceTool" },

    orderId: { type: String },
    currency: { type: String, required: true },
    transactionAmount: { type: Number, required: true },
    transactionStatus: { type: String, required: true },
    transactionDate: { type: Number, required: true },
    rewards: { type: Number, required: false },


    // paymentId: { type: String },
    // accountId: { type: String },
    // transferId: { type: String, required: false },
    // transactionType: { type: String },
    // transactionMethod: {
    //   type: {
    //     type: String,
    //     required: true,
    //   },
    //   id: {
    //     type: String,
    //     required: false,
    //   },
    // },
    // transactionDescription: { type: String },
    // transactionFrom: { type: String, required: true },
    // transactionTo: { type: String, required: true },

    // refundStatus: { type: String, required: false },
    // refundAmount: { type: Number, required: false },

    // acquirerData: { type: Object, required: false },
    // earn: { type: String, required: false },
    // spend: { type: String, required: false },
    // fee: { type: Number, required: false },
    // tax: { type: Number, required: false },

    // email: { type: String, required: false },
    // contact: { type: String, required: false },

    // error: { type: Object, required: false },

    // bank: { type: Object, required: false },
    // wallet: { type: Object, required: false },
  },
  { timestamps: true }
);

transactionSchema.index({ transactionId: 1 }, { unique: true });

export default conn_v2.model<ITransaction>("Transaction", transactionSchema);
