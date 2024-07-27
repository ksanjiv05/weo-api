import mongoose, { Schema } from "mongoose";
import { conn_v2 } from "../db";

export interface INegotiationAttempt extends Document {
  offer: any;
  user: any;
  noOfAttempts: number;
}

const negotiationAttemptSchema: Schema = new Schema({
  offer: { type: Schema.Types.ObjectId, ref: "Offer" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  noOfAttempts: { type: Number, default: 0 },
});

negotiationAttemptSchema.index({ offer: 1, user: 1 }, { unique: true });

export default conn_v2.model<INegotiationAttempt>(
  "NegotiationAttempt",
  negotiationAttemptSchema
);
