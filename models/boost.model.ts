// Objective : Define the boost model and interface
// Author : Sanjiv Kumar Pandit

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

export interface IBoost extends Document {
  offer: any; // offer reference
  boostActiveDate: string;
  boostExpiryDate: string;
  boostStatus: string;
  boostCost: number;
  discount: number;
  oValue: number;
}

const BoostSchema: Schema = new Schema({
  offer: { type: Schema.Types.ObjectId, ref: "Offer" },
  boostActiveDate: { type: String },
  boostExpiryDate: { type: String },
  boostStatus: { type: String },
  boostCost: { type: Number },
  discount: { type: Number },
  oValue: { type: Number },
});

export const Boost = conn_v2.model<IBoost>("Boost", BoostSchema);
