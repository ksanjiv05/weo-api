//Objective : Define the listed model and interface
//Author : Sanjiv Kumar Pandit

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

// one 2 offer A
// 1 offer sold B 1 used
// 1 offer sold C

//Order
export interface IListed extends Document {
  offer: any; // offer reference
  brand: any; // brand reference
  user: any;
  ownership: [
    {
      owner: [
        {
          ownerId: string; // user ref
          isCurrentOwner: boolean;
        }
      ]; // user reference
      offer_access_codes: [
        {
          code: string; // access code combination of //offer id and sum number(0001 - 9999)
          status: string; //pending //delivered
          transaction: any; // transaction reference
        }
      ];
      deliveryCount: number;
      currentInstallment: number;
      totalInstallment: number;
      installmentDueDate: string;
      offerActivationDate: string;
      offerExpiryDate: string;
    }
  ]; // order reference
}

const ListedSchema: Schema = new Schema({
  offer: { type: Schema.Types.ObjectId, ref: "Offer" },
  brand: { type: Schema.Types.ObjectId, ref: "Brand" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  ownership: [
    {
      owner: [
        {
          ownerId: { type: Schema.Types.ObjectId, ref: "User" },
          isCurrentOwner: { type: Boolean, default: true },
        },
      ],
      transaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
      offer_access_codes: [
        {
          code: { type: String },
          status: { type: String },
        },
      ],
      deliveryCount: { type: Number, default: 0 },
      currentInstallment: { type: Number, default: 0 },
      totalInstallment: { type: Number, default: 0 },
      installmentDueDate: { type: String },
      offerActivationDate: { type: String },
      offerExpiryDate: { type: String },
    },
  ],
});

export default conn_v2.model<IListed>("Listed", ListedSchema);
