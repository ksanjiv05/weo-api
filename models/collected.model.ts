//Objective : Define the Collected model and interface
//Author : Sanjiv Kumar Pandit

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

// one 2 offer A
// 1 offer sold B 1 used
// 1 offer sold C

//Order
export interface ICollected extends Document {
  offer: any; // offer reference
  brand: any; // brand reference
  user: any;
  offerDataId: any;
  offerName: string;
  offerThumbnail: string;
  ownerships: any; // order reference
  outlet: any;
}

const CollectedSchema: Schema = new Schema({
  offer: { type: Schema.Types.ObjectId, ref: "Offer" },
  brand: { type: Schema.Types.ObjectId, ref: "Brand" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  offerDataId: { type: Schema.Types.ObjectId, ref: "OfferData" },
  offerName: { type: String },
  offerThumbnail: { type: String },
  ownerships: {
    type: Schema.Types.ObjectId,
    ref: "Ownership",
  },
  outlet: { type: Schema.Types.ObjectId, ref: "Outlet" },
});

// CollectedSchema.index({ offer: 1, brand: 1, user: 1 }, { unique: true });

export default conn_v2.model<ICollected>("Collected", CollectedSchema);
