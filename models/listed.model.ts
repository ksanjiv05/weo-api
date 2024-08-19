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
  ownerships: any; // order reference
}

const ListedSchema: Schema = new Schema(
  {
    offer: { type: Schema.Types.ObjectId, ref: "Offer" },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    ownerships: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ownership",
      },
    ],
  },
  { timestamps: true }
);

ListedSchema.index({ offer: 1, brand: 1, user: 1 }, { unique: true });

export default conn_v2.model<IListed>("Listed", ListedSchema);
